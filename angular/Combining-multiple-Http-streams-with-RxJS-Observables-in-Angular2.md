# Author: **Daniele Ghidoli**

https://blog.danieleghidoli.it/2016/10/22/http-rxjs-observables-angular/

RxJS Observables, compared to the old Promises in Angular 1, seem to be more complicated to understand, but they are far more flexible. Let’s see how we can combine and chain them, in order to merge multiple Http streams of data and get what we need.

The first thing we need to understand is that the **Http** service in Angular2 returns **cold Observables**. What does it mean “cold”? According to the [definition](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/creating.md#cold-vs-hot-observables):

>Cold observables start running upon subscription, i.e., the observable sequence only starts pushing values to the observers when Subscribe is called.

If you want to know more about cold and hot Observables, you can refer to [this awesome article from Thoughtram](http://blog.thoughtram.io/angular/2016/06/16/cold-vs-hot-observables.html). For now, what we just need to know is that we have to manipulate our stream of data before calling the **subscribe()** method on the Observable.

A best practice, indeed, is keeping all the stream manipulation logic inside our service and return the Observable, that can be subscribed by the controller.

Here is a basic example of service with an **Http** call:

```javascript
@Injectable()
export class AuthorService {
 
  constructor(private http: Http){}
 
  get(id: number): Observable<any> {
    return this.http.get('/api/authors/' + id)
      .map((res: any) => res.json());
  }
}
```
The controller should call the service, like this:

```javascript
@Component({
  selector: 'app-author',
  templateUrl: './author.component.html'
})
export class AuthorComponent implements OnInit {
 
  constructor(private authorService: AuthorService) {}
 
  ngOnInit() {
    this.authorService.get(1).subscribe((data: any) => {
      console.log(data);
    });
  }
 
}
 
/* Will return:
 
{
  id: 1,
  first_name: 'Daniele',
  last_name: 'Ghidoli'
}
 
*/
```

Ok, now let’s see something more advanced!

## Combining Observables in parallel

Imagine that you want to get the data of an author and his books, but in order to get the books you need to call a different endpoint, such as **/authors/1/books**. You should make the two calls and combine them in one response.

In order to do that, we can use the **forkJoin** RxJS operator, which is similar to the old **$q.all()** from Angular 1 and lets you execute two or more Observables in parallel:

```javascript
getAuthorWithBooks(id: number): Observable<any> {
  return Observable.forkJoin([
    this.http.get('/api/authors/' + id).map(res => res.json()),
    this.http.get('/api/authors/' + id + '/books').map(res => res.json())
  ])
  .map((data: any[]) => {
    let author: any = data[0];
    let books: any[] = data[1];
    return author.books = books;
  });
}
 
/* Will return:
 
{
  id: 1,
  first_name: 'Daniele',
  last_name: 'Ghidoli'
  books: [{
    id: 10,
    title: 'Awesome book',
    author_id: 1
  }, 
  ...
  ]
}
 
*/
```

As you can see from the example, **forkJoin** returns an Array with the results of the joined Observables. We can compose them as we need, in order to return just one object.

## Combining Observables in series

What if we need, for example, to get the author info from a book? We should get the book data first and, only when we get it, we can call the authors endpoint with the author id.

In this case we’ll have to use the **flatMap** RxJS operator, which is similar to the usual **map** RxJS operator. The difference is that lets you chain two Observables, returning a new Observable:

```javascript
getBookAuthor(id: number): Observable<any> {
  return this.http.get('/api/books/' + id)
    .map((res: any) => res.json())
    .flatMap((book: any) => {
      return this.http.get('/api/authors/' + book.author_id)
        .map((res: any) => res.json());
    });
}
 
/* Will return:
 
{
  id: 1,
  first_name: 'Daniele',
  last_name: 'Ghidoli'
}
 
*/
```

In this case, what we will get is just the author info. What if we want also the book object? As before, we have to compose our objects:

```javascript
getBookWithAuthor(id: number): Observable<any> {
  return this.http.get('/api/books/' + id)
    .map((res: any) => res.json())
    .flatMap((book: any) => {
      return this.http.get('/api/authors/' + book.author_id)
        .map((res: any) => {
          let author = res.json();
          book.author = author;
          return book;
        });
    });
}
 
/* Will return:
 
{
  id: 10,
  title: 'Awesome book',
  author_id: 1
  author: {
    id: 1,
    first_name: 'Daniele',
    last_name: 'Ghidoli'
  }
}
 
*/
```

## Combining Observables in series and in parallel

What if now we would like to do the same (getting the book with its author), but for multiple books at once? We can combine **forkJoin** and **flatMap**:

```javascript
getBooksWithAuthor(): Observable<any[]> {
  return this.http.get('/api/books/')
    .map((res: any) => res.json())
    .flatMap((books: any[]) => {
      if (books.length > 0) {
        return Observable.forkJoin(
          books.map((book: any) => {
            return this.http.get('/api/authors/' + book.author_id)
              .map((res: any) => {
                let author: any = res.json();
                book.author = author;
                return book;
              });
          });
        );
      }
      return Observable.of([]);
    });
}
 
/* Will return:
 
[{
  id: 10,
  title: 'Awesome book',
  author_id: 1
  author: {
    id: 1,
    first_name: 'Daniele',
    last_name: 'Ghidoli'
  }
},
{
  id: 11,
  title: 'Another awesome book',
  author_id: 2
  author: {
    id: 2,
    first_name: 'Jeff',
    last_name: 'Arese'
  }
}]
 
*/
```

It seems complicated, but it’s quite easy: after getting the list of books, we use the **flatMap**, in order to merge the previous call with the result of the **forkJoin**, that is called only if we have some books, otherwise we just return an Observable containing an empty array (line 17).

Maybe you are wondering why we are using the **forkJoin** here, since there is just a call. But, if you look better, there will be as much calls as many books we get. In fact, at line 7 we are looping on the books array with the **Array.map** function, **which is not the same as the "map" RxJS Operator!**

Then, for each author call we combine our objects and we return the book, which is what we want. Easy!

Another example can be getting author and editor info for a single book:

```javascript
getBookWithDetails(id: number): Observable<any> {
  return this.http.get('/api/books/' + id)
    .map((res: any) => res.json())
    .flatMap((book: any) => {
      return Observable.forkJoin(
         Observable.of(book),
         this.http.get('/api/authors/' + book.author_id).map((res: any) => res.json()),
         this.http.get('/api/editors/' + book.editor_id).map((res: any) => res.json())
      )
        .map((data: any[]) => {
          let book = data[0];
          let author = data[1];
          let editor = data[2];
          book.author = author;
          book.editor = editor;
          return book;
        });
    });
}
 
 
/* Will return:
 
{
  id: 10,
  title: 'Awesome book',
  author_id: 1,
  editor_id: 42
  author: {
    id: 1,
    first_name: 'Daniele',
    last_name: 'Ghidoli'
  }, 
  editor: {
    id: 42,
    name: 'Universe Editor'
  }
}
 
*/
```

As we can see, the **forkJoin** return an array with the result of each Observable, that we can compose in order to return the final object. Note that we are forkJoining the **book** object itself, converting it in an Observable thanks to the **of** RxJS operator, so that we can access it in the following **map**.

## Including the operators

The last thing I would like to share with you (maybe should have been the first!): don’t forget to include the RxJS operators you are using. You can import all at once by using:

```javascript
import 'rxjs/Rx';
```

But it’s better to import just the operators you are actually using. In our case:

```javascript
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
```

Note: we have to import the **mergeMap** operator, as it’s needed by **flatMap** to work.

I hope that RxJS operator are more clear now! Enjoy!
