# Author: Chris Pawlukiewicz
Link: https://medium.com/@paynoattn/3-common-mistakes-i-see-people-use-in-rx-and-the-observable-pattern-ba55fee3d031


# 3 Common Mistakes I see people use in Rx and the Observable Pattern

Maybe you haven’t heard of Observables, but they’re amazeballs. They’re like Promises, only they can resolve more then once, and can easily be [mapped](http://reactivex.io/documentation/operators/map.html), [debounced](http://reactivex.io/documentation/operators/debounce.html), [merged](http://reactivex.io/documentation/operators/merge.html) and [zipped](http://reactivex.io/documentation/operators/zip.html).

[They’ve been around forever, but have recently gained popularity due to Microsoft and Netflix’s efforts to make them available in Javascript.](https://github.com/Reactive-Extensions/RxJS)

There are many reasons why you should be using observables over Promises, but that’s another discussion for another time.

## 1. Taking Data out of Observables to put into other Observables.

One of the most often mistakes I see people make is when people take data out of an observable to send it to another observable.

```javascript
initialize() {
  let id;
  this.appParameters.subscribe(params => id = params['id']);
  if (id !== null && id!== undefined) {
    this.getUser(id).subscribe(user => this.user = user);
  }
}
```

You may be wondering what’s wrong with this. The code works, right? Since the appParameters returns immediately, the code is able to pass the data to the variable outside appParameters scope, and retrieve the data correctly. It’s easy to read, and short and sweet, right!?

There are two problems though.
* You are taking an asynchronous operation and assuming it will work synchronously.

And it may 99% of the time. But when it isn’t, your code will break, terribly.

* You are taking data outside of the Observable stream.

Observables are streams. They are designed to be written in functional streams. One thing catalyzes another. It’s simple, beautiful, and tranquil, like this endless stream of cats flowing down the stairs.

Never ever take data out of an observable stream. Take that variable and put it back into the observable scope.

## 2. Using multiple Observable.subscribes in an expression.

Looking at the example above, one common other pattern I see above that developers may do to refactor this to keep everything asynchronous is the following.

```javascript
initialize() {
  this.appParameters.subscribe(params => {
    const id = params['id'];
    if (id !== null && id!== undefined) {
      this.getUser(id).subscribe(user => this.user = user);
    }
  });
}
```

While you have kept everything inside the observable, you’re still not hearing about the beauty that is the observable stream.

> **But it’s like Observableception, right? No. Observables do not like being inside Observables.**

We can keep everything in the stream by using the [switchMap](https://www.learnrxjs.io/operators/transformation/switchmap.html switchMap) operator. _(Alternative you can use the [mergeMap](https://www.learnrxjs.io/operators/transformation/mergemap.html) or [flatMap](http://reactivex.io/documentation/operators/flatmap.html) operators, but they won’t cancel XHRs and may run more then once)_.

```javascript
initialize() {
  this.appParameters
    .map(params => params['id'])
    .switchMap(id => {
      if(id !== null && id !== undefined) { 
        return this.getUser(id)
      }
    })
    .subscribe(user => this.user = user);
}
```

Ahh, so much better. Like from a mountain estuary the stream floweth.

But there’s still a problem with this code. Can you spot it?

## 3. Not returning an Observable when it’s expected.

One common mistake engineers make with Observables is not understanding one simple fact — an Observable is kept alive until it completes. In the above example, if there is no id passed to the switchMap, the Observable never completes.

Don’t leave your Observables hanging there like this sports guy dude.

```javascript
initialize() {
  this.appParameters
    .map(params => params['id'])
    .switchMap(id => {
      if(id !== null && id !== undefined) { 
        return this.getUser(id)
      } else { 
        return Observable.empty()
      }
    })
    .subscribe(user => this.user = user);
}
```

Here Observable.empty() completes the Observable stream (and the subscribe is never reached), but you can use any Observable that completes, like Observable.of(null)

But, Chris!! That code is so long! Look at the example you started with. Surely we can clean it up, no?

Of course. I was just being more expressive for clarity. If your language / codebase supports ternary operators, you can make your code much more concise (but be careful, because more concise code doesn’t actually mean less code is being run).

```javascript
initialize() {
  this.appParameters.map(params => params['id'])
    .switchMap(id => id ? this.getUser(id) : Observable.empty())
    .subscribe(user => this.user = user);
}
```

Ahhhhhhhh. Be one with the Observable stream, ladies and gents, like yoda.
