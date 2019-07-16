```javascript
const objectToQueryString = (obj) => Object.keys(obj).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join('&');
objectToQueryString({name: 'Anonystick', age: 18, address: 'VietNam'})

Output
// name=Anonystick&age=18&address=VietNam
```
