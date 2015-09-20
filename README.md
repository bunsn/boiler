# Boiler

Boiler aims to simplify the task of exporting financial data from banking websites. It is currently experimental, prerelease software, to test if it’s possible to support many financial institutions through crowd-sourced statement definitions.

## Installation

Boiler is an npm module, designed to be run a browser environment.

```
npm i @bunsn/boiler
```

## Example Usage

```javascript
var statementDefinitions = require('@bunsn/boiler/statement-definitions')
var Statement = require('@bunsn/boiler/statement')

// Find a statement definition
var definition = statementDefinitions.findByHost(window.location.host)

// Create a statement from the definition
var statement = new Statement(definition)

// Do something with the parsed data
console.log(statement.transactions.toJSON(['date', 'description', 'amount']))
```

## Statement Definitions

A statement definition is a plain old JavaScript object and contains all the information needed to scrape a particular bank’s table of transactions. The following properties are supported:

### `institution` {String}

The name of the financial institution or bank.

### `host` {String}

The host name of the statement page (can be found by calling: `window.location.host`).

### `columns` {Array}

The names of the columns in the order they appear in the table. Column names include:

- `'date'` (required)
- `'type'` - often used to denote how a transaction was made e.g. ATM or DD
- `'description'` (required)
- `'paidIn'` (required if no `amount`)
- `'paidOut'` (required if no `amount`)
- `'amount'` (required unless `paidIn` & `paidOut` given) - a positive number for income, negative for outgoings
- `'balance'`
- `null` - for any empty columns

### `dateFormat` {String}

The format used on transaction dates. Takes inspiration from the [year, month, and day tokens in moment.js](http://momentjs.com/docs/#/parsing/string-format/), e.g.

- **1 Apr 2015** has format: `D MMM YYYY`
- **1 Apr** has format: `D MMM`
- **01/04/2015** has format `DD/MM/YYYY`
- **2015-04-01** has format `YYYY-MM-DD`

### `table` {Function|Node}

A function with returns the DOM node of the target table. Alternatively you can pass in the table node itself.

### `date` {Function|Date} (optional)

A function that returns the statement date (a `Date` instance). This is used to generate transaction dates for statements that omit the year-part in the date cell (I’m looking at you, HSBC!). Alternatively you can pass in a native `Date` object.

### Example

Here is the NatWest statement definition:

```javascript
{
  institution: 'NatWest',
  host: 'www.nwolb.com',
  columns: ['date', 'type', 'description', 'paidIn', 'paidOut', 'balance'],
  dateFormat: 'D MMM YYYY',
  table: function () {
    return window.frames.ctl00_secframe.contentDocument.querySelector('.ItemsTable')
  }
}
```

### Developing & Testing

1. Log in to your online banking site, and navigate to a page of transactions.
2. Construct your statement definition in your text editor or in your browser’s developer tools console (see above for a list of statement definition properties).
3. Add [the developer script](dist/boiler.min.js) to the page either by copy and pasting the script into the your browser’s developer tools console, or appending the script to the DOM (this might be useful if your bank uses frames and your get cross-origin frame errors). To add the script, run the following code in your browser’s developer tools console:

   ```javascript
   (function () {
     var script = document.createElement('script')
     script.src = 'https://rawgit.com/bunsn/boiler/master/dist/boiler.min.js'
     document.body.appendChild(script)
   })()
   ```
4. Test your definition by running the following in a dev tools console:

   ```javascript
   var definition  = { … } // The definition you created in Step 2.
   __boiler__.testStatementDefinition(definition)
   ```

   If successful, you should see a brief summary of the statement’s transactions. Otherwise you’ll get an error. (At this early stage, the error message probably won’t be too helpful!)

   Note: this script does not store or send your transactions elsewhere. It is deliberately limited in functionality to discourage its use in production.

## API

### `Statement`

Takes in a statement definition and parses a table of transactions to set up its `transactions` property.

```javascript
var statement = new Statement(definition)
statement.transactions // an instance of Transactions
```

See [transaction.js](transaction.js) for more documentation.

### `Transactions`

Takes in an array of `Transaction` objects, and associated statement:

```javascript
var transactions = new Transactions([…], statement)
transactions.first()
transactions.last()
transactions.toArray(['date', 'type', 'description', 'amount'])
transactions.toJSON(['date', 'description', 'amount'])
```

See [transactions.js](transactions.js) for more documentation.

### `Transaction`

Represents a transaction and is responsible for transforming and formatting raw values.

```javascript
var transaction = new Transaction({…})
transaction.getFormatted('date')
```

See [transaction.js](transaction.js) for more documentation.

## Limitations

Boiler makes extensive use of ES5 array methods, and so you’ll require a reasonably modern browser to use it. It’s also early days, so some functionality may be limited.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (ISC).

***

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
