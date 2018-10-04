# 1. Component

Here’s the full code for our component:

```javascript
import { Component } from '@angular/core';
import { SearchService } from './search.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [SearchService]
})
export class AppComponent {
  results: Object;
  searchTerm$ = new Subject<string>();

  constructor(private searchService: SearchService) {
    this.searchService.search(this.searchTerm$)
      .subscribe(results => {
        this.results = results.results;
      });
  }
}
```

### Key takeaways:
- We inject a search service that we’ll define next. The search service is responsible for the bulk of the work.
- We make use of an RxJS Subject, which acts as both an Observable and an Observer. Our subject has a next() method that we’ll use in the template to pass our search term to the subject as we type.
- We subscribe to the searchService.search Observable in our constructor and assign the results to a property in our component called results.

# 2. Search Service

Here’s the code for our search service:

```javascript
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class SearchService {
  baseUrl: string = 'https://api.cdnjs.com/libraries';
  queryUrl: string = '?search=';

  constructor(private http: Http) { }

  search(terms: Observable<string>) {
    return terms.debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => this.searchEntries(term));
  }

  searchEntries(term) {
    return this.http
        .get(this.baseUrl + this.queryUrl + term)
        .map(res => res.json());
  }
}
```

### Key takeaways:
- First we import the necessary RxJS operators and the Http client service, then we also inject Http in the constructor.
- We define string properties in our service class for the base and query urls of our API, the cdnjs API in this case.
- Our search method takes in a observable of strings, goes through a few operators to limit the amount of requests that go through and then calls a searchEntries method. debounceTime waits until there’s no new data for the provided amount of time (400ms in this case) until it lets the next data through. distinctUntilChanged will ensure that only distinct data passes through. If the user types something, erases a character quickly and then types back the same character, distinctUntilChanged will only send the data once. Finally, switchMap combines multiple possible observables received from the searchEntries method into one, which ensures that we use the results from the latest request only.
- Our searchEntries method makes a get request to our API endpoint with our search term, this gives us another observable. We then use the map operator to map the results to a Json object.

# 3. Template

And finally here’s our template code:

```html
<input
    (keyup)="searchTerm$.next($event.target.value)">

<ul *ngIf="results">
  <li *ngFor="let result of results | slice:0:9">
    <a href="{{ result.latest }}" target="_blank">
      {{ result.name }}
    </a>
  </li>
</ul>
```

###Key takeaways:
- We call the next() method on keyup events of our input and send in the input string value.
- We iterate over our results with ngFor and use the slice pipe to return only the first 10 results. slice is available by default as part of Angular’s Common module.
- We then simply create list items with our results. In the case of this API, the returned Json object has name and latest properties, and latest contains the url to the latest version of the file.
