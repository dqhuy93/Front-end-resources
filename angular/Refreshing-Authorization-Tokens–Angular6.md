# Author: **Maina Wycliffe**
# Link: https://theinfogrid.com/tech/developers/angular/refreshing-authorization-tokens-angular-6/

In this post, we are going to build a http interceptor for refreshing authorization tokens once expired. The idea here is to be able to intercept http requests, attach an authorization header to the request. And to intercept http response, check for authentication errors and refresh tokens when necessary, otherwise redirect to the login page.

Once the token has been refreshed successfully, you should resend all intercepted HTTP responses back to their origin, and only return a non auth related error back to the end user. This whole process should occur smoothly without breaking the UX if successful. We should only interrupt the user when action is needed from them – such as log in in this case.

## Getting Started
Let’s first start by creating a HTTP Interceptor class, then adding it to our module (app.module.ts).

ng generate class http-auth-interceptor

Then, open the http interceptor and make the following modifications to it:

```javascript
@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {}
}
```

First, we made the class injectable. Then, we implemented the [HTTP Interceptor](https://angular.io/api/common/http/HttpInterceptor) Interface, by one, adding implements **HttpInterceptor**. And two, by adding the **intercept** method – the method that will intercept and return the modified requests. Most of the action will take place inside this method.

Next, we need to add the newly created http interceptor class to the list of providers, in our module:

```javascript
@NgModule({
  imports: [CommonModule, MatDialogModule],
  declarations: [],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptor,
      multi: true
    }
  ]
})
```

**Intercepting HTTP Requests (Adding Authorization Header)**
Here, will are going to take the intercepted request, clone it, modify the copied http requests and return it as the new request.

```javascript
// Clone the request and authorization header
const authReq = req.clone({
  headers: req.headers.set('authorization', Authorization ? Authorization : '')
});
```

**NB**: _You can attach the header based on the authorization method you are using on your server. Example: Bearer Authorization_.

After that, you can return the modified request which replaces the original request:

```javascript
return next.handle(authReq)
```

## Refreshing Authorization Tokens
### Intercepting Expired Tokens Request
To refresh tokens, we need to monitor the responses looking for http status code 401 for unauthorized request. So, we are going to pipe our modified http request, and catch all errors. Next, we are going to check for http status code 401. Whenever we catch an authentication error, we are going to attempt and refresh our token.

```javascript
return next.handle(authReq).pipe(
   catchError(error => {
       // checks if a url is to an admin api or not
       if (error.status === 401) {
          // attempting to refresh our token
       }
   }
});
```

We also need to avoid sending multiple refresh requests to our endpoint. This happens when you send multiple http requests simultaneously, and all of them return an authentication error. So, we are going to share (using [Share Operator](https://www.learnrxjs.io/operators/multicasting/share.html)) the existing refresh request across all intercepted http responses that find a token refresh request already inflight.

Basically, when we catch a response with http status code 401, we are going to check if there is an inflight request to refresh our token, then hitch on it. If none exists, we are going to send a new refresh request.

In our http interceptor class, we need to and **inflightAuthRequest** property and set it to null. Then, when we get a http response error 401, we are going to check whether it is null.

```javascript
if (!this.inflightAuthRequest) {
  this.inflightAuthRequest = authService.refreshToken();

  if (!this.inflightAuthRequest) {
     // remove existing tokens
     localStorage.clear();
     this.router.navigate(['/sign-page']);
     return throwError(error);
   }
}
```

If not, we are going to pipe the existing request and attach our request using **SwitchMap** operator. After the token has been refreshed successfully, we are going to resend each of our http request (that responded with 401) back to the server, hoping to get another response not related to authentication.

```javascript
return this.inflightAuthRequest.pipe(
  switchMap((newToken: string) => {
    // unset inflight request
    this.inflightAuthRequest = null;

    // clone the original request
    const authReqRepeat = req.clone({
      headers: req.headers.set('', newToken)
    });

    // resend the request
    return next.handle(authReqRepeat);
  })
);
```

### Our Refresh Method
In our refresh method, we are just going to be making a http request to our refresh token endpoint. This is also where we will add the [RXJS Share Operator](https://www.learnrxjs.io/operators/multicasting/share.html), ensuring that only one request is sent at a time:

```javascript
refreshToken(): Observable<string> {

    const url = 'url to refresh token here';

    // append refresh token if you have one
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http
      .get(url, {
        headers: new HttpHeaders().set('refreshToken', refreshToken),
        observe: 'response'
      })
      .pipe(
        share(), // <========== YOU HAVE TO SHARE THIS OBSERVABLE TO AVOID MULTIPLE REQUEST BEING SENT SIMULTANEOUSLY
        map(res => {
          const token = res.headers.get('token');
          const newRefreshToken = res.headers.get('refreshToken');

          // store the new tokens
          localStorage.setItem('refreshToken', newRefreshToken);
          localStorage.setItem('token', token);
          return token;
       })
    );
}
```

## Whitelist and Blacklist Requests
What we would like to achieve in this section is a simple way to exempt some request from going through a http interceptor. There are several ways used to achieve this. One common way is to attach a header to requests which you do not want to be modified by the interceptor. Then, check if the header is present at the beginning of the interceptor method. And if present, return an unmodified http request:

```javascript
if (req.headers.get('authExempt') === 'true') {
  return next.handle(req);
}
```

This is functional but requires you to manually add the header on the requests you are blacklisting. The other method which I consider to be much better, is to have a blacklist containing URLs or URL regex patterns. The idea being that if a URL is on the list, then you can exempt it from being modified by the http interceptor. For instance, you can simply exempt an entire sub directory using a simple [regex](https://regex101.com/):

```javascript
(((https?):\/\/|www\.)theinfogrid.com\/auth\/)
```

The above regex exempts all subdirectories with auth directory at the root. So, you can check if your URL is in the blacklist or not:

```javascript
blacklistCheckup($url: string): boolean {

   let returnValue = false;

   for (const i of Object.keys(this.blacklist)) {
      if (this.blacklist[i].exec($url) !== null) {
        returnValue = true;
        break;
      }
   }

   return returnValue;
}
```

This gives you the freedom to blacklist or whitelist an entire domain/subdomain, without needing to attach a header to the request manually. You can then package it as an object and iterate through it. I am assuming, this should be a small list, because if it becomes too large, it will impact the performance of your app.

## Tips
1. You might want to consider attaching a header to the response originating from the refresh token endpoint. Then, check if the response contains the header before sending another refresh request. And if it does, and has status code 401, it means that the token was not refreshed successfully. Thus, you should redirect the user to the login page instead of sending another refresh token, which could lead into a loop of some sort.

```javascript
if (error.status === 401) {
  // check if the response is from the token refresh end point
  const isFromRefreshTokenEndpoint = !!error.headers.get(
    'unableToRefreshToken'
  );

  if (isFromRefreshTokenEndpoint) {
    localStorage.clear();
    this.router.navigate(['/sign-page']);
    return throwError(error);
}
```

2. To work around the Cyclic Dependency Error, do not inject your AuthService inside the constructor. Instead, inject the injector class and then use it inside the interceptor method to inject AuthService into a variable. The constructor for our http interceptor

```javascript
constructor(private injector: Injector, ...) {}
```

And then inside our method:

```javascript
const authService = this.injector.get(AuthService);
```

## Get this Code
You can get the complete code [here](https://github.com/MainaWycliffe/refreshing-authorization-token-angular-6).
