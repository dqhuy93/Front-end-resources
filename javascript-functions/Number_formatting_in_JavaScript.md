There are many different ways of printing an integer with a comma as a thousands separators in JavaScript.

One of the simplest ways is to use `String.prototype.replace()` function with the following arguments:

- regular expression: `(?=(\d{3})+(?!\d))`
- replacement value: `$1`,
- Regular expression matches a single digit `\d` followed by a three-digit sets only `(?=(\d{3})+(?!\d))`. The matched digit is then replaced with `$1`,. 
The `$1` is a special replacement pattern which holds a value of the first parenthesized sub-match string (in our case it is the matched digit). 
The `,` (comma) character is our separator character. 
We could use `.` to get number in the following format, e.g., `XXX.XXX.XXX`. Note that some countries use `.` (dot) as a thousands separator.

Example:
```javascript
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

console.info(formatNumber(2665)) // 2,665
console.info(formatNumber(102665)) // 102,665
console.info(formatNumber(111102665)) // 111,102,665
```

That approach method also works with decimal numbers.

```javascript
console.info(formatNumber(1240.5)) // 1,240.5
console.info(formatNumber(1000240.5)) // 1,000,240.5
```

You must be careful when using `.` (dot) as a separator with numbers having digits after the decimal point though. The decimal point is always presented as a dot character in JavaScript. So using a dot as a separator could give you the following results:

```
1240.5 -> 1.240.5

1000240.5 -> 1.000.240.5
```

## Currency Formatting

Note that this method (with small modifications) may also be used for currency formatting e.g.

```javascript
function currencyFormat(num) {
  return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

console.info(currencyFormat(2665)) // $2,665.00
console.info(currencyFormat(102665)) // $102,665.00
```

For currency formatting, I used `Number.prototype.toFixed()` to convert a number to string to have always two decimal digits.

If you need to format currency for a different country / locale, you would need to add some modifications to the currencyFormat method. A sample currency formatting function for DE locale:

```javascript
function currencyFormatDE(num) {
  return (
    num
      .toFixed(2) // always two decimal digits
      .replace('.', ',') // replace decimal point character with ,
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' €'
  ) // use . as a separator
}

console.info(currencyFormatDE(1234567.89)) // output 1.234.567,89 €
```

Note that there are also lots of different currency formatting JavaScript libraries which does all the formatting work for you. So in the case of larger projects, where more formatting formats are required, I would suggest using one of that libraries. I personally use AngularJS i18n localization module when possible.
