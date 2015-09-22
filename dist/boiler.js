(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.__boiler__ = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Statement = require('./statement')

module.exports = {
  testStatementDefinition: function (definition) {
    try {
      var statement = new Statement(definition)
      var transactions = statement.transactions
      var label = 'transaction' + (transactions.length === 1 ? '' : 's')
      var separator = '=============================================='

      console.log(separator)
      console.log('Boiler: ' + statement.name())
      console.log(transactions.length + ' ' + label + ' parsed')

      if (statement.transactions.length > 1) {
        console.log('First transaction:', transactions.first().toJSON())
        console.log('Last transaction:', transactions.last().toJSON())
      } else if (statement.transactions.length) {
        console.log('Transaction:', transactions.first())
      }
      console.log(separator)
    } catch (error) {
      console.log('Could not create Statement: ' + error.message)
    }
  }
}

},{"./statement":8}],2:[function(require,module,exports){
var makeNumber = require('./make-number')

/**
 * Removes any non-numerical symbols and returns the absolute value.
 * Useful for converting numbers formatted as currency.
 * e.g. "-£3,426.72" converts to 3426.72
 * @returns {Number}
 */

module.exports = function makeAbsoluteNumber (value) {
  var number = makeNumber(value)
  if (number == null) return null
  return Math.abs(number)
}

},{"./make-number":3}],3:[function(require,module,exports){
/**
 * Removes any non-numerical symbols.
 * Useful for converting numbers formatted as currency.
 * e.g. "-£3,426.72" converts to -3426.72
 * @returns {Number}
 */

module.exports = function makeNumber (value) {
  var number = Number(String(value).replace(/[^\d\.-]/g, ''))
  return number || null
}

},{}],4:[function(require,module,exports){
var monthFormats = {
  MMM: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  MMMM: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
}

function parseDate (dateString, format) {
  var formatParts = format.match(/(D{1,2})|(M{1,4})|(Y{2,4})/g)
  var dateRegex = RegExp(format.replace(/DD?/, '(\\d\\d?)')
                               .replace(/M{3,4}/, '([a-zA-Z]{3,})')
                               .replace(/MM?/, '(\\d\\d?)')
                               .replace(/Y{2,4}/, '(\\d{2,4})'))
  var dateParts = dateString.match(dateRegex)

  if (dateParts) {
    dateParts = dateParts.splice(1)
  } else {
    throw new Error('Cannot parse: `' + dateString + '` with format: `' + format + '`')
  }

  function getPartIndex (regex) {
    for (var i = 0; i < formatParts.length; i++) {
      if (regex.test(formatParts[i])) return i
    }
  }

  var date = dateParts[getPartIndex(/D/)]

  // Get month part and convert to number compatible with `Date`

  var month = (function getMonth () {
    var i = getPartIndex(/M/)
    var monthFormat = formatParts[i]
    var datePart = dateParts[i].toLowerCase()
    var month

    if (monthFormat.length > 2) {
      month = monthFormats[monthFormat].indexOf(datePart)
    } else {
      month = Number(datePart) - 1
    }

    return month
  })()

  // Get year part and convert to number compatible with `Date`

  var year = (function getYear () {
    var year = dateParts[getPartIndex(/Y/)]

    if (year && (year.length === 2)) year = '20' + year

    return year
  })()

  return { year: year, month: month, date: date }
}

module.exports = parseDate

},{}],5:[function(require,module,exports){
module.exports = function (object) {
  return (typeof object === 'function') ? object.call(object) : object
}

},{}],6:[function(require,module,exports){
/**
 * Represents a table node
 */

function Table (element) {
  this.element = element
}

/**
 * @returns A 2D array representation of the given rows
 */

Table.prototype.rowsToArray = function (rows, options) {
  options = options || {}
  var processRow = options.processRow || id
  var processCell = options.processCell || id

  return map(rows, function (tr, rowIndex, rows) {
    var row = map(tr.cells, function (node, cellIndex, cells) {
      return processCell(nodeText(node), cellIndex, cells, node)
    })

    return processRow(row, rowIndex, rows, tr)
  })
}

/**
 * @returns A 2D array representation of the table
 */

Table.prototype.toArray = function () {
  return this.rowsToArray(this.element.querySelectorAll('tbody tr'))
}

/**
 * Squashed and trimmed node text content
 */

function nodeText (node) {
  return squashWhitespace(node.textContent)

  function squashWhitespace (string) {
    return string.replace(/\s{2,}/g, ' ').trim()
  }
}

/**
 * map for NodeLists
 */

function map (array, enumerator) {
  return Array.prototype.map.call(array, enumerator)
}

/**
 * Identity function
 * @returns Its input!
 */

function id (x) { return x }

module.exports = Table

},{}],7:[function(require,module,exports){
/**
 * Maps keys to values
 * @param {Array} keys - An array of keys
 * @param {Array} values - An array of raw values
 * @returns {Object}
 */

function weld (keys, values) {
  var object = {}
  for (var i = keys.length - 1; i >= 0; i--) object[keys[i]] = values[i]
  return object
}

module.exports = weld

},{}],8:[function(require,module,exports){
var result = require('./lib/result')
var Table = require('./lib/table')
var weld = require('./lib/weld')
var Transaction = require('./transaction')
var Transactions = require('./transactions')

/**
 * Represents a Statement
 * @constructor
 * @param {Object} attributes - Usually a statement definition
 */

function Statement (attributes) {
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) this[key] = result(attributes[key])
  }

  // Convert table rows to array of transactions
  var transactions = Table.prototype.rowsToArray(this.rows, {
    processRow: function (row) {
      return this.createTransaction(weld(this.columns, row))
    }.bind(this)
  })
  this.transactions = new Transactions(transactions, this)
}

/**
 * Creates a transaction from an object of attributes.
 * @returns {Transaction}
 */

Statement.prototype.createTransaction = function (attributes) {
  attributes.dateString = attributes.date
  attributes.dateFormat = this.dateFormat
  delete attributes.date
  return new Transaction(attributes)
}

/**
 * @returns {String} The name of the statement based on the statement date
 */

Statement.prototype.name = function () {
  var label = this.institution + ' Statement'

  if (this.transactions.length) {
    return label + ' ' + this.transactions.last().getFormatted('date')
  }
  return label
}

module.exports = Statement

},{"./lib/result":5,"./lib/table":6,"./lib/weld":7,"./transaction":11,"./transactions":12}],9:[function(require,module,exports){
var parseDate = require('./lib/parse-date')

/**
 * Represents a transaction date
 * @constructor
 * @private
 */

function TransactionDate (dateString, format, options) {
  options = options || {}
  var parsed = parseDate(dateString, format)

  this.year = parsed.year
  this.month = parsed.month
  this.date = parsed.date

  if (!this.year && options.succeedingDate) {
    this.year = this.calculateYear(options.succeedingDate)
  }
}

/**
 * @returns {Date} A native Date representation of the transaction date
 */

TransactionDate.prototype.toDate = function () {
  if (!Date.parse(this.year, this.month, this.date)) return null
  return new Date(this.year, this.month, this.date)
}

/**
 * Uses the succeeding date to determine the transaction year
 * @returns {Number}
 */

TransactionDate.prototype.calculateYear = function (succeedingDate) {
  var year = succeedingDate.getFullYear()

  // Dec - Jan
  if (succeedingDate.getMonth() === 0 && this.month === 11) year--

  return year
}

module.exports = TransactionDate

},{"./lib/parse-date":4}],10:[function(require,module,exports){
/**
 * Represents a collection of transaction dates
 * @constructor
 * @private
 * @param {Array} dates - An array of objects in the form { year: year, month: month, date: date }
 */

function TransactionDates (dates) {
  this.dates = dates
}

/**
 * Determines whether the dates are chronological or not
 * @returns {Boolean}
 */

TransactionDates.prototype.chronological = function () {
  var uniq = this.uniq()
  if (uniq.length < 2) return true

  return this.compare(uniq[0], uniq[1]) >= 0
}

/**
 * @returns {Array} The unique dates
 */

TransactionDates.prototype.uniq = function () {
  var uniqs = []

  for (var i = 0; i < this.dates.length; i++) {
    var date = this.dates[i]
    if (inUniqs(date)) continue
    uniqs.push(date)
  }

  return uniqs

  // Determines whether a date already exists in the uniqs array
  function inUniqs (d) {
    return uniqs.some(function (u) {
      return u.year === d.year && u.month === d.month && u.date === d.date
    })
  }
}

/**
 * Compares two dates to test chronology
 * @returns {Number} 0: a == b, 1: a > b, -1: a < b
 */

TransactionDates.prototype.compare = function (a, b) {
  // If no year, and dates go from Dec - Jan, assume Dec date is older
  if ((!a.year || !b.year) && a.month === 11 && b.month === 0) return 1

  if (a.year === b.year) {
    if (a.month === b.month) {
      if (a.date > b.date) return -1
      if (a.date < b.date) return 1
      return 0
    }

    if (a.month > b.month) return -1
    if (a.month < b.month) return 1
  }
  if (a.year > b.year) return -1
  if (a.year < b.year) return 1
}

module.exports = TransactionDates

},{}],11:[function(require,module,exports){
var makeNumber = require('./lib/number/make-number')
var makeAbsoluteNumber = require('./lib/number/make-absolute-number')
var TransactionDate = require('./transaction-date')

/**
 * Represents a single transaction.
 * Getters and setters are used to transform and format values. Also responsible
 * for calculating amounts and dates when missing or invalid.
 * @constructor
 * @param {Object} attributes
 */

function Transaction (attributes) {
  this.attributes = {}

  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) this.set(key, attributes[key])
  }

  if (!this.get('date')) this.setDate()
  if (!this.get('amount')) this.setAmount()
}

/**
 * Functions that transform attributes as they are set
 */

Transaction.prototype.transformers = {
  amount: makeNumber,
  balance: makeNumber,
  paidIn: makeAbsoluteNumber,
  paidOut: makeAbsoluteNumber,
  date: function (date) {
    if (!(date instanceof Date)) return date

    // Convert to GMT to ensure correct JSON values
    date.setHours(date.getHours() - date.getTimezoneOffset() / 60)
    return date
  }
}

/**
 * Functions that format attributes when retrieved with `getFormatted`
 */

Transaction.prototype.formatters = {
  date: formatDate
}

/**
 * Transforms and sets the given attribute
 * @param {String} key - The name of the attribute
 * @param value - The value of the attribute
 */

Transaction.prototype.set = function (key, value) {
  var transformer = this.transformers[key] || idFunction
  this.attributes[key] = transformer(value)
}

/**
 * @returns the stored attribute
 */

Transaction.prototype.get = function (key) {
  return this.attributes[key]
}

/**
 * Get a value formatted by the corresponding formatter
 * @param key - The key of the value to return
 * @returns The formatted attribute
 */

Transaction.prototype.getFormatted = function (key) {
  var formatter = this.formatters[key] || idFunction
  return formatter(this.get(key))
}

/**
 * Returns an array representation of the given keys or all formatted
 * attributes.
 * @param {Array} keys - An array of attribute keys
 * @returns {Array} - An array of formatted attributes
 */

Transaction.prototype.toArray = function (keys) {
  keys = keys || Object.keys(this.attributes)
  return keys.map(this.getFormatted.bind(this))
}

/**
 * Returns an object of formatted values of the given keys or all formatted
 * attributes.
 * @param {Array} keys - An array of attribute keys
 * @returns {Array} - An array of formatted attributes
 */

Transaction.prototype.toJSON = function (keys) {
  keys = keys || Object.keys(this.attributes)
  var object = {}

  for (var i = keys.length - 1; i >= 0; i--) {
    var key = keys[i]
    object[key] = this.getFormatted(key)
  }

  return object
}

Transaction.prototype.setDate = function (attrs) {
  attrs = attrs || {}
  var dateString = attrs.dateString || this.get('dateString')
  var dateFormat = attrs.dateFormat || this.get('dateFormat')
  var succeedingDate = attrs.succeedingDate

  var transactionDate = new TransactionDate(dateString, dateFormat, {
    succeedingDate: succeedingDate
  })
  this.set('transactionDate', transactionDate)
  this.set('date', transactionDate.toDate())
}

Transaction.prototype.setAmount = function () {
  var paidIn = this.get('paidIn')
  var paidOut = this.get('paidOut')

  this.set('amount', calculateAmount(paidIn, paidOut))
}

function calculateAmount (paidIn, paidOut) {
  return paidIn || -paidOut
}

function formatDate (value) {
  var yyyy = value.getFullYear()
  var mm = padZeroes(value.getMonth() + 1)
  var dd = padZeroes(value.getDate())

  return [yyyy, mm, dd].join('-')

  function padZeroes (number) {
    return String('00' + number).slice(-2)
  }
}

function idFunction (x) { return x }

module.exports = Transaction

},{"./lib/number/make-absolute-number":2,"./lib/number/make-number":3,"./transaction-date":9}],12:[function(require,module,exports){
var TransactionDates = require('./transaction-dates')

/**
 * An array-like class that represents a collection of transactions
 * @constructor
 * @param {Array} transactions - An array of Transaction objects
 * @param {Object} statement - The parent statement
 * @returns {Array} - An array of transactions with convenience methods
 */

function Transactions (transactions, statement) {
  Transactions._injectPrototypeMethods(transactions)

  /**
   * Some financial institutions omit the year part in their date cells.
   * This workaround calculates the year for each transaction affected.
   */

  if (!/Y{2,}/.test(statement.dateFormat)) {
    if (!transactions.chronological()) transactions = transactions.reverse()

    var succeedingDate = statement.date
    for (var i = transactions.length - 1; i >= 0; i--) {
      var transaction = transactions[i]
      transaction.setDate({ succeedingDate: succeedingDate })
      succeedingDate = transaction.get('date')
    }
  }

  return transactions
}

Transactions.prototype.chronological = function () {
  return dates.call(this).chronological()

  function dates () {
    var dates = this.map(function (transaction) {
      return transaction.get('transactionDate')
    })
    return new TransactionDates(dates)
  }
}

/**
 * @returns {Transaction} The first transaction in the collection
 */

Transactions.prototype.first = function () {
  return this[0]
}

/**
 * @returns {Transaction} The last transaction in the collection
 */

Transactions.prototype.last = function () {
  return this[this.length - 1]
}

/**
 * @returns {Array} An array of formatted transaction attribute arrays
 */

Transactions.prototype.toArray = function (keys) {
  return this.map(function (transaction) { return transaction.toArray(keys) })
}

/**
 * @returns {Array} An array of formatted transaction objects
 */

Transactions.prototype.toJSON = function (keys) {
  return this.map(function (transaction) { return transaction.toJSON(keys) })
}

/**
 * Adds the prototype methods to transactions array to appear like inheritance
 * @private
 */

Transactions._injectPrototypeMethods = function (array) {
  for (var method in this.prototype) {
    if (this.prototype.hasOwnProperty(method)) {
      array[method] = this.prototype[method]
    }
  }
}

module.exports = Transactions

},{"./transaction-dates":10}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXIuanMiLCJsaWIvbnVtYmVyL21ha2UtbnVtYmVyLmpzIiwibGliL3BhcnNlLWRhdGUuanMiLCJsaWIvcmVzdWx0LmpzIiwibGliL3RhYmxlLmpzIiwibGliL3dlbGQuanMiLCJzdGF0ZW1lbnQuanMiLCJ0cmFuc2FjdGlvbi1kYXRlLmpzIiwidHJhbnNhY3Rpb24tZGF0ZXMuanMiLCJ0cmFuc2FjdGlvbi5qcyIsInRyYW5zYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFN0YXRlbWVudCA9IHJlcXVpcmUoJy4vc3RhdGVtZW50JylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRlc3RTdGF0ZW1lbnREZWZpbml0aW9uOiBmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIHRyeSB7XG4gICAgICB2YXIgc3RhdGVtZW50ID0gbmV3IFN0YXRlbWVudChkZWZpbml0aW9uKVxuICAgICAgdmFyIHRyYW5zYWN0aW9ucyA9IHN0YXRlbWVudC50cmFuc2FjdGlvbnNcbiAgICAgIHZhciBsYWJlbCA9ICd0cmFuc2FjdGlvbicgKyAodHJhbnNhY3Rpb25zLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnKVxuICAgICAgdmFyIHNlcGFyYXRvciA9ICc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09J1xuXG4gICAgICBjb25zb2xlLmxvZyhzZXBhcmF0b3IpXG4gICAgICBjb25zb2xlLmxvZygnQm9pbGVyOiAnICsgc3RhdGVtZW50Lm5hbWUoKSlcbiAgICAgIGNvbnNvbGUubG9nKHRyYW5zYWN0aW9ucy5sZW5ndGggKyAnICcgKyBsYWJlbCArICcgcGFyc2VkJylcblxuICAgICAgaWYgKHN0YXRlbWVudC50cmFuc2FjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRmlyc3QgdHJhbnNhY3Rpb246JywgdHJhbnNhY3Rpb25zLmZpcnN0KCkudG9KU09OKCkpXG4gICAgICAgIGNvbnNvbGUubG9nKCdMYXN0IHRyYW5zYWN0aW9uOicsIHRyYW5zYWN0aW9ucy5sYXN0KCkudG9KU09OKCkpXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlbWVudC50cmFuc2FjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUcmFuc2FjdGlvbjonLCB0cmFuc2FjdGlvbnMuZmlyc3QoKSlcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKHNlcGFyYXRvcilcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5sb2coJ0NvdWxkIG5vdCBjcmVhdGUgU3RhdGVtZW50OiAnICsgZXJyb3IubWVzc2FnZSlcbiAgICB9XG4gIH1cbn1cbiIsInZhciBtYWtlTnVtYmVyID0gcmVxdWlyZSgnLi9tYWtlLW51bWJlcicpXG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgbm9uLW51bWVyaWNhbCBzeW1ib2xzIGFuZCByZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZS5cbiAqIFVzZWZ1bCBmb3IgY29udmVydGluZyBudW1iZXJzIGZvcm1hdHRlZCBhcyBjdXJyZW5jeS5cbiAqIGUuZy4gXCItwqMzLDQyNi43MlwiIGNvbnZlcnRzIHRvIDM0MjYuNzJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYWtlQWJzb2x1dGVOdW1iZXIgKHZhbHVlKSB7XG4gIHZhciBudW1iZXIgPSBtYWtlTnVtYmVyKHZhbHVlKVxuICBpZiAobnVtYmVyID09IG51bGwpIHJldHVybiBudWxsXG4gIHJldHVybiBNYXRoLmFicyhudW1iZXIpXG59XG4iLCIvKipcbiAqIFJlbW92ZXMgYW55IG5vbi1udW1lcmljYWwgc3ltYm9scy5cbiAqIFVzZWZ1bCBmb3IgY29udmVydGluZyBudW1iZXJzIGZvcm1hdHRlZCBhcyBjdXJyZW5jeS5cbiAqIGUuZy4gXCItwqMzLDQyNi43MlwiIGNvbnZlcnRzIHRvIC0zNDI2LjcyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWFrZU51bWJlciAodmFsdWUpIHtcbiAgdmFyIG51bWJlciA9IE51bWJlcihTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teXFxkXFwuLV0vZywgJycpKVxuICByZXR1cm4gbnVtYmVyIHx8IG51bGxcbn1cbiIsInZhciBtb250aEZvcm1hdHMgPSB7XG4gIE1NTTogWydqYW4nLCAnZmViJywgJ21hcicsICdhcHInLCAnbWF5JywgJ2p1bicsICdqdWwnLCAnYXVnJywgJ3NlcCcsICdvY3QnLCAnbm92JywgJ2RlYyddLFxuICBNTU1NOiBbJ2phbnVhcnknLCAnZmVicnVhcnknLCAnbWFyY2gnLCAnYXByaWwnLCAnbWF5JywgJ2p1bmUnLCAnanVseScsICdhdWd1c3QnLCAnc2VwdGVtYmVyJywgJ29jdG9iZXInLCAnbm92ZW1iZXInLCAnZGVjZW1iZXInXVxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCkge1xuICB2YXIgZm9ybWF0UGFydHMgPSBmb3JtYXQubWF0Y2goLyhEezEsMn0pfChNezEsNH0pfChZezIsNH0pL2cpXG4gIHZhciBkYXRlUmVnZXggPSBSZWdFeHAoZm9ybWF0LnJlcGxhY2UoL0REPy8sICcoXFxcXGRcXFxcZD8pJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvTXszLDR9LywgJyhbYS16QS1aXXszLH0pJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvTU0/LywgJyhcXFxcZFxcXFxkPyknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9ZezIsNH0vLCAnKFxcXFxkezIsNH0pJykpXG4gIHZhciBkYXRlUGFydHMgPSBkYXRlU3RyaW5nLm1hdGNoKGRhdGVSZWdleClcblxuICBpZiAoZGF0ZVBhcnRzKSB7XG4gICAgZGF0ZVBhcnRzID0gZGF0ZVBhcnRzLnNwbGljZSgxKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHBhcnNlOiBgJyArIGRhdGVTdHJpbmcgKyAnYCB3aXRoIGZvcm1hdDogYCcgKyBmb3JtYXQgKyAnYCcpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYXJ0SW5kZXggKHJlZ2V4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtYXRQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlZ2V4LnRlc3QoZm9ybWF0UGFydHNbaV0pKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHZhciBkYXRlID0gZGF0ZVBhcnRzW2dldFBhcnRJbmRleCgvRC8pXVxuXG4gIC8vIEdldCBtb250aCBwYXJ0IGFuZCBjb252ZXJ0IHRvIG51bWJlciBjb21wYXRpYmxlIHdpdGggYERhdGVgXG5cbiAgdmFyIG1vbnRoID0gKGZ1bmN0aW9uIGdldE1vbnRoICgpIHtcbiAgICB2YXIgaSA9IGdldFBhcnRJbmRleCgvTS8pXG4gICAgdmFyIG1vbnRoRm9ybWF0ID0gZm9ybWF0UGFydHNbaV1cbiAgICB2YXIgZGF0ZVBhcnQgPSBkYXRlUGFydHNbaV0udG9Mb3dlckNhc2UoKVxuICAgIHZhciBtb250aFxuXG4gICAgaWYgKG1vbnRoRm9ybWF0Lmxlbmd0aCA+IDIpIHtcbiAgICAgIG1vbnRoID0gbW9udGhGb3JtYXRzW21vbnRoRm9ybWF0XS5pbmRleE9mKGRhdGVQYXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBtb250aCA9IE51bWJlcihkYXRlUGFydCkgLSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG1vbnRoXG4gIH0pKClcblxuICAvLyBHZXQgeWVhciBwYXJ0IGFuZCBjb252ZXJ0IHRvIG51bWJlciBjb21wYXRpYmxlIHdpdGggYERhdGVgXG5cbiAgdmFyIHllYXIgPSAoZnVuY3Rpb24gZ2V0WWVhciAoKSB7XG4gICAgdmFyIHllYXIgPSBkYXRlUGFydHNbZ2V0UGFydEluZGV4KC9ZLyldXG5cbiAgICBpZiAoeWVhciAmJiAoeWVhci5sZW5ndGggPT09IDIpKSB5ZWFyID0gJzIwJyArIHllYXJcblxuICAgIHJldHVybiB5ZWFyXG4gIH0pKClcblxuICByZXR1cm4geyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRhdGU6IGRhdGUgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlRGF0ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJykgPyBvYmplY3QuY2FsbChvYmplY3QpIDogb2JqZWN0XG59XG4iLCIvKipcbiAqIFJlcHJlc2VudHMgYSB0YWJsZSBub2RlXG4gKi9cblxuZnVuY3Rpb24gVGFibGUgKGVsZW1lbnQpIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxufVxuXG4vKipcbiAqIEByZXR1cm5zIEEgMkQgYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHJvd3NcbiAqL1xuXG5UYWJsZS5wcm90b3R5cGUucm93c1RvQXJyYXkgPSBmdW5jdGlvbiAocm93cywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcHJvY2Vzc1JvdyA9IG9wdGlvbnMucHJvY2Vzc1JvdyB8fCBpZFxuICB2YXIgcHJvY2Vzc0NlbGwgPSBvcHRpb25zLnByb2Nlc3NDZWxsIHx8IGlkXG5cbiAgcmV0dXJuIG1hcChyb3dzLCBmdW5jdGlvbiAodHIsIHJvd0luZGV4LCByb3dzKSB7XG4gICAgdmFyIHJvdyA9IG1hcCh0ci5jZWxscywgZnVuY3Rpb24gKG5vZGUsIGNlbGxJbmRleCwgY2VsbHMpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzQ2VsbChub2RlVGV4dChub2RlKSwgY2VsbEluZGV4LCBjZWxscywgbm9kZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb2Nlc3NSb3cocm93LCByb3dJbmRleCwgcm93cywgdHIpXG4gIH0pXG59XG5cbi8qKlxuICogQHJldHVybnMgQSAyRCBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGFibGVcbiAqL1xuXG5UYWJsZS5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucm93c1RvQXJyYXkodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3Rib2R5IHRyJykpXG59XG5cbi8qKlxuICogU3F1YXNoZWQgYW5kIHRyaW1tZWQgbm9kZSB0ZXh0IGNvbnRlbnRcbiAqL1xuXG5mdW5jdGlvbiBub2RlVGV4dCAobm9kZSkge1xuICByZXR1cm4gc3F1YXNoV2hpdGVzcGFjZShub2RlLnRleHRDb250ZW50KVxuXG4gIGZ1bmN0aW9uIHNxdWFzaFdoaXRlc3BhY2UgKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzezIsfS9nLCAnICcpLnRyaW0oKVxuICB9XG59XG5cbi8qKlxuICogbWFwIGZvciBOb2RlTGlzdHNcbiAqL1xuXG5mdW5jdGlvbiBtYXAgKGFycmF5LCBlbnVtZXJhdG9yKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyYXksIGVudW1lcmF0b3IpXG59XG5cbi8qKlxuICogSWRlbnRpdHkgZnVuY3Rpb25cbiAqIEByZXR1cm5zIEl0cyBpbnB1dCFcbiAqL1xuXG5mdW5jdGlvbiBpZCAoeCkgeyByZXR1cm4geCB9XG5cbm1vZHVsZS5leHBvcnRzID0gVGFibGVcbiIsIi8qKlxuICogTWFwcyBrZXlzIHRvIHZhbHVlc1xuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGtleXNcbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyAtIEFuIGFycmF5IG9mIHJhdyB2YWx1ZXNcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gd2VsZCAoa2V5cywgdmFsdWVzKSB7XG4gIHZhciBvYmplY3QgPSB7fVxuICBmb3IgKHZhciBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgb2JqZWN0W2tleXNbaV1dID0gdmFsdWVzW2ldXG4gIHJldHVybiBvYmplY3Rcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3ZWxkXG4iLCJ2YXIgcmVzdWx0ID0gcmVxdWlyZSgnLi9saWIvcmVzdWx0JylcbnZhciBUYWJsZSA9IHJlcXVpcmUoJy4vbGliL3RhYmxlJylcbnZhciB3ZWxkID0gcmVxdWlyZSgnLi9saWIvd2VsZCcpXG52YXIgVHJhbnNhY3Rpb24gPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9uJylcbnZhciBUcmFuc2FjdGlvbnMgPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9ucycpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIFN0YXRlbWVudFxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIFVzdWFsbHkgYSBzdGF0ZW1lbnQgZGVmaW5pdGlvblxuICovXG5cbmZ1bmN0aW9uIFN0YXRlbWVudCAoYXR0cmlidXRlcykge1xuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGtleSkpIHRoaXNba2V5XSA9IHJlc3VsdChhdHRyaWJ1dGVzW2tleV0pXG4gIH1cblxuICAvLyBDb252ZXJ0IHRhYmxlIHJvd3MgdG8gYXJyYXkgb2YgdHJhbnNhY3Rpb25zXG4gIHZhciB0cmFuc2FjdGlvbnMgPSBUYWJsZS5wcm90b3R5cGUucm93c1RvQXJyYXkodGhpcy5yb3dzLCB7XG4gICAgcHJvY2Vzc1JvdzogZnVuY3Rpb24gKHJvdykge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVHJhbnNhY3Rpb24od2VsZCh0aGlzLmNvbHVtbnMsIHJvdykpXG4gICAgfS5iaW5kKHRoaXMpXG4gIH0pXG4gIHRoaXMudHJhbnNhY3Rpb25zID0gbmV3IFRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbnMsIHRoaXMpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRyYW5zYWN0aW9uIGZyb20gYW4gb2JqZWN0IG9mIGF0dHJpYnV0ZXMuXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259XG4gKi9cblxuU3RhdGVtZW50LnByb3RvdHlwZS5jcmVhdGVUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gIGF0dHJpYnV0ZXMuZGF0ZVN0cmluZyA9IGF0dHJpYnV0ZXMuZGF0ZVxuICBhdHRyaWJ1dGVzLmRhdGVGb3JtYXQgPSB0aGlzLmRhdGVGb3JtYXRcbiAgZGVsZXRlIGF0dHJpYnV0ZXMuZGF0ZVxuICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKGF0dHJpYnV0ZXMpXG59XG5cbi8qKlxuICogQHJldHVybnMge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIHN0YXRlbWVudCBiYXNlZCBvbiB0aGUgc3RhdGVtZW50IGRhdGVcbiAqL1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYWJlbCA9IHRoaXMuaW5zdGl0dXRpb24gKyAnIFN0YXRlbWVudCdcblxuICBpZiAodGhpcy50cmFuc2FjdGlvbnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGxhYmVsICsgJyAnICsgdGhpcy50cmFuc2FjdGlvbnMubGFzdCgpLmdldEZvcm1hdHRlZCgnZGF0ZScpXG4gIH1cbiAgcmV0dXJuIGxhYmVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVtZW50XG4iLCJ2YXIgcGFyc2VEYXRlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UtZGF0ZScpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRyYW5zYWN0aW9uIGRhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBUcmFuc2FjdGlvbkRhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcGFyc2VkID0gcGFyc2VEYXRlKGRhdGVTdHJpbmcsIGZvcm1hdClcblxuICB0aGlzLnllYXIgPSBwYXJzZWQueWVhclxuICB0aGlzLm1vbnRoID0gcGFyc2VkLm1vbnRoXG4gIHRoaXMuZGF0ZSA9IHBhcnNlZC5kYXRlXG5cbiAgaWYgKCF0aGlzLnllYXIgJiYgb3B0aW9ucy5zdWNjZWVkaW5nRGF0ZSkge1xuICAgIHRoaXMueWVhciA9IHRoaXMuY2FsY3VsYXRlWWVhcihvcHRpb25zLnN1Y2NlZWRpbmdEYXRlKVxuICB9XG59XG5cbi8qKlxuICogQHJldHVybnMge0RhdGV9IEEgbmF0aXZlIERhdGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zYWN0aW9uIGRhdGVcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGUucHJvdG90eXBlLnRvRGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFEYXRlLnBhcnNlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKVxufVxuXG4vKipcbiAqIFVzZXMgdGhlIHN1Y2NlZWRpbmcgZGF0ZSB0byBkZXRlcm1pbmUgdGhlIHRyYW5zYWN0aW9uIHllYXJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlLnByb3RvdHlwZS5jYWxjdWxhdGVZZWFyID0gZnVuY3Rpb24gKHN1Y2NlZWRpbmdEYXRlKSB7XG4gIHZhciB5ZWFyID0gc3VjY2VlZGluZ0RhdGUuZ2V0RnVsbFllYXIoKVxuXG4gIC8vIERlYyAtIEphblxuICBpZiAoc3VjY2VlZGluZ0RhdGUuZ2V0TW9udGgoKSA9PT0gMCAmJiB0aGlzLm1vbnRoID09PSAxMSkgeWVhci0tXG5cbiAgcmV0dXJuIHllYXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbkRhdGVcbiIsIi8qKlxuICogUmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgdHJhbnNhY3Rpb24gZGF0ZXNcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGRhdGVzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSB7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF0ZTogZGF0ZSB9XG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25EYXRlcyAoZGF0ZXMpIHtcbiAgdGhpcy5kYXRlcyA9IGRhdGVzXG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBkYXRlcyBhcmUgY2hyb25vbG9naWNhbCBvciBub3RcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5cblRyYW5zYWN0aW9uRGF0ZXMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB1bmlxID0gdGhpcy51bmlxKClcbiAgaWYgKHVuaXEubGVuZ3RoIDwgMikgcmV0dXJuIHRydWVcblxuICByZXR1cm4gdGhpcy5jb21wYXJlKHVuaXFbMF0sIHVuaXFbMV0pID49IDBcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB1bmlxdWUgZGF0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGVzLnByb3RvdHlwZS51bmlxID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdW5pcXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkYXRlID0gdGhpcy5kYXRlc1tpXVxuICAgIGlmIChpblVuaXFzKGRhdGUpKSBjb250aW51ZVxuICAgIHVuaXFzLnB1c2goZGF0ZSlcbiAgfVxuXG4gIHJldHVybiB1bmlxc1xuXG4gIC8vIERldGVybWluZXMgd2hldGhlciBhIGRhdGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHVuaXFzIGFycmF5XG4gIGZ1bmN0aW9uIGluVW5pcXMgKGQpIHtcbiAgICByZXR1cm4gdW5pcXMuc29tZShmdW5jdGlvbiAodSkge1xuICAgICAgcmV0dXJuIHUueWVhciA9PT0gZC55ZWFyICYmIHUubW9udGggPT09IGQubW9udGggJiYgdS5kYXRlID09PSBkLmRhdGVcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIGRhdGVzIHRvIHRlc3QgY2hyb25vbG9neVxuICogQHJldHVybnMge051bWJlcn0gMDogYSA9PSBiLCAxOiBhID4gYiwgLTE6IGEgPCBiXG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlcy5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIC8vIElmIG5vIHllYXIsIGFuZCBkYXRlcyBnbyBmcm9tIERlYyAtIEphbiwgYXNzdW1lIERlYyBkYXRlIGlzIG9sZGVyXG4gIGlmICgoIWEueWVhciB8fCAhYi55ZWFyKSAmJiBhLm1vbnRoID09PSAxMSAmJiBiLm1vbnRoID09PSAwKSByZXR1cm4gMVxuXG4gIGlmIChhLnllYXIgPT09IGIueWVhcikge1xuICAgIGlmIChhLm1vbnRoID09PSBiLm1vbnRoKSB7XG4gICAgICBpZiAoYS5kYXRlID4gYi5kYXRlKSByZXR1cm4gLTFcbiAgICAgIGlmIChhLmRhdGUgPCBiLmRhdGUpIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuICAgIGlmIChhLm1vbnRoID4gYi5tb250aCkgcmV0dXJuIC0xXG4gICAgaWYgKGEubW9udGggPCBiLm1vbnRoKSByZXR1cm4gMVxuICB9XG4gIGlmIChhLnllYXIgPiBiLnllYXIpIHJldHVybiAtMVxuICBpZiAoYS55ZWFyIDwgYi55ZWFyKSByZXR1cm4gMVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zYWN0aW9uRGF0ZXNcbiIsInZhciBtYWtlTnVtYmVyID0gcmVxdWlyZSgnLi9saWIvbnVtYmVyL21ha2UtbnVtYmVyJylcbnZhciBtYWtlQWJzb2x1dGVOdW1iZXIgPSByZXF1aXJlKCcuL2xpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXInKVxudmFyIFRyYW5zYWN0aW9uRGF0ZSA9IHJlcXVpcmUoJy4vdHJhbnNhY3Rpb24tZGF0ZScpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNpbmdsZSB0cmFuc2FjdGlvbi5cbiAqIEdldHRlcnMgYW5kIHNldHRlcnMgYXJlIHVzZWQgdG8gdHJhbnNmb3JtIGFuZCBmb3JtYXQgdmFsdWVzLiBBbHNvIHJlc3BvbnNpYmxlXG4gKiBmb3IgY2FsY3VsYXRpbmcgYW1vdW50cyBhbmQgZGF0ZXMgd2hlbiBtaXNzaW5nIG9yIGludmFsaWQuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgdGhpcy5hdHRyaWJ1dGVzID0ge31cblxuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGtleSkpIHRoaXMuc2V0KGtleSwgYXR0cmlidXRlc1trZXldKVxuICB9XG5cbiAgaWYgKCF0aGlzLmdldCgnZGF0ZScpKSB0aGlzLnNldERhdGUoKVxuICBpZiAoIXRoaXMuZ2V0KCdhbW91bnQnKSkgdGhpcy5zZXRBbW91bnQoKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IHRyYW5zZm9ybSBhdHRyaWJ1dGVzIGFzIHRoZXkgYXJlIHNldFxuICovXG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS50cmFuc2Zvcm1lcnMgPSB7XG4gIGFtb3VudDogbWFrZU51bWJlcixcbiAgYmFsYW5jZTogbWFrZU51bWJlcixcbiAgcGFpZEluOiBtYWtlQWJzb2x1dGVOdW1iZXIsXG4gIHBhaWRPdXQ6IG1ha2VBYnNvbHV0ZU51bWJlcixcbiAgZGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybiBkYXRlXG5cbiAgICAvLyBDb252ZXJ0IHRvIEdNVCB0byBlbnN1cmUgY29ycmVjdCBKU09OIHZhbHVlc1xuICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpIC0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjApXG4gICAgcmV0dXJuIGRhdGVcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IGZvcm1hdCBhdHRyaWJ1dGVzIHdoZW4gcmV0cmlldmVkIHdpdGggYGdldEZvcm1hdHRlZGBcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZm9ybWF0dGVycyA9IHtcbiAgZGF0ZTogZm9ybWF0RGF0ZVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYW5kIHNldHMgdGhlIGdpdmVuIGF0dHJpYnV0ZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHZhciB0cmFuc2Zvcm1lciA9IHRoaXMudHJhbnNmb3JtZXJzW2tleV0gfHwgaWRGdW5jdGlvblxuICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHRyYW5zZm9ybWVyKHZhbHVlKVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHRoZSBzdG9yZWQgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1trZXldXG59XG5cbi8qKlxuICogR2V0IGEgdmFsdWUgZm9ybWF0dGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIGZvcm1hdHRlclxuICogQHBhcmFtIGtleSAtIFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJldHVyblxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBhdHRyaWJ1dGVcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZ2V0Rm9ybWF0dGVkID0gZnVuY3Rpb24gKGtleSkge1xuICB2YXIgZm9ybWF0dGVyID0gdGhpcy5mb3JtYXR0ZXJzW2tleV0gfHwgaWRGdW5jdGlvblxuICByZXR1cm4gZm9ybWF0dGVyKHRoaXMuZ2V0KGtleSkpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4ga2V5cyBvciBhbGwgZm9ybWF0dGVkXG4gKiBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBrZXlzXG4gKiBAcmV0dXJucyB7QXJyYXl9IC0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIGF0dHJpYnV0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gIGtleXMgPSBrZXlzIHx8IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcbiAgcmV0dXJuIGtleXMubWFwKHRoaXMuZ2V0Rm9ybWF0dGVkLmJpbmQodGhpcykpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgZm9ybWF0dGVkIHZhbHVlcyBvZiB0aGUgZ2l2ZW4ga2V5cyBvciBhbGwgZm9ybWF0dGVkXG4gKiBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBrZXlzXG4gKiBAcmV0dXJucyB7QXJyYXl9IC0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIGF0dHJpYnV0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleXMpIHtcbiAga2V5cyA9IGtleXMgfHwgT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuICB2YXIgb2JqZWN0ID0ge31cblxuICBmb3IgKHZhciBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgb2JqZWN0W2tleV0gPSB0aGlzLmdldEZvcm1hdHRlZChrZXkpXG4gIH1cblxuICByZXR1cm4gb2JqZWN0XG59XG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5zZXREYXRlID0gZnVuY3Rpb24gKGF0dHJzKSB7XG4gIGF0dHJzID0gYXR0cnMgfHwge31cbiAgdmFyIGRhdGVTdHJpbmcgPSBhdHRycy5kYXRlU3RyaW5nIHx8IHRoaXMuZ2V0KCdkYXRlU3RyaW5nJylcbiAgdmFyIGRhdGVGb3JtYXQgPSBhdHRycy5kYXRlRm9ybWF0IHx8IHRoaXMuZ2V0KCdkYXRlRm9ybWF0JylcbiAgdmFyIHN1Y2NlZWRpbmdEYXRlID0gYXR0cnMuc3VjY2VlZGluZ0RhdGVcblxuICB2YXIgdHJhbnNhY3Rpb25EYXRlID0gbmV3IFRyYW5zYWN0aW9uRGF0ZShkYXRlU3RyaW5nLCBkYXRlRm9ybWF0LCB7XG4gICAgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlXG4gIH0pXG4gIHRoaXMuc2V0KCd0cmFuc2FjdGlvbkRhdGUnLCB0cmFuc2FjdGlvbkRhdGUpXG4gIHRoaXMuc2V0KCdkYXRlJywgdHJhbnNhY3Rpb25EYXRlLnRvRGF0ZSgpKVxufVxuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuc2V0QW1vdW50ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFpZEluID0gdGhpcy5nZXQoJ3BhaWRJbicpXG4gIHZhciBwYWlkT3V0ID0gdGhpcy5nZXQoJ3BhaWRPdXQnKVxuXG4gIHRoaXMuc2V0KCdhbW91bnQnLCBjYWxjdWxhdGVBbW91bnQocGFpZEluLCBwYWlkT3V0KSlcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlQW1vdW50IChwYWlkSW4sIHBhaWRPdXQpIHtcbiAgcmV0dXJuIHBhaWRJbiB8fCAtcGFpZE91dFxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlICh2YWx1ZSkge1xuICB2YXIgeXl5eSA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgdmFyIG1tID0gcGFkWmVyb2VzKHZhbHVlLmdldE1vbnRoKCkgKyAxKVxuICB2YXIgZGQgPSBwYWRaZXJvZXModmFsdWUuZ2V0RGF0ZSgpKVxuXG4gIHJldHVybiBbeXl5eSwgbW0sIGRkXS5qb2luKCctJylcblxuICBmdW5jdGlvbiBwYWRaZXJvZXMgKG51bWJlcikge1xuICAgIHJldHVybiBTdHJpbmcoJzAwJyArIG51bWJlcikuc2xpY2UoLTIpXG4gIH1cbn1cblxuZnVuY3Rpb24gaWRGdW5jdGlvbiAoeCkgeyByZXR1cm4geCB9XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNhY3Rpb25cbiIsInZhciBUcmFuc2FjdGlvbkRhdGVzID0gcmVxdWlyZSgnLi90cmFuc2FjdGlvbi1kYXRlcycpXG5cbi8qKlxuICogQW4gYXJyYXktbGlrZSBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBjb2xsZWN0aW9uIG9mIHRyYW5zYWN0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSB0cmFuc2FjdGlvbnMgLSBBbiBhcnJheSBvZiBUcmFuc2FjdGlvbiBvYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhdGVtZW50IC0gVGhlIHBhcmVudCBzdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtBcnJheX0gLSBBbiBhcnJheSBvZiB0cmFuc2FjdGlvbnMgd2l0aCBjb252ZW5pZW5jZSBtZXRob2RzXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25zICh0cmFuc2FjdGlvbnMsIHN0YXRlbWVudCkge1xuICBUcmFuc2FjdGlvbnMuX2luamVjdFByb3RvdHlwZU1ldGhvZHModHJhbnNhY3Rpb25zKVxuXG4gIC8qKlxuICAgKiBTb21lIGZpbmFuY2lhbCBpbnN0aXR1dGlvbnMgb21pdCB0aGUgeWVhciBwYXJ0IGluIHRoZWlyIGRhdGUgY2VsbHMuXG4gICAqIFRoaXMgd29ya2Fyb3VuZCBjYWxjdWxhdGVzIHRoZSB5ZWFyIGZvciBlYWNoIHRyYW5zYWN0aW9uIGFmZmVjdGVkLlxuICAgKi9cblxuICBpZiAoIS9ZezIsfS8udGVzdChzdGF0ZW1lbnQuZGF0ZUZvcm1hdCkpIHtcbiAgICBpZiAoIXRyYW5zYWN0aW9ucy5jaHJvbm9sb2dpY2FsKCkpIHRyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucy5yZXZlcnNlKClcblxuICAgIHZhciBzdWNjZWVkaW5nRGF0ZSA9IHN0YXRlbWVudC5kYXRlXG4gICAgZm9yICh2YXIgaSA9IHRyYW5zYWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb25zW2ldXG4gICAgICB0cmFuc2FjdGlvbi5zZXREYXRlKHsgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlIH0pXG4gICAgICBzdWNjZWVkaW5nRGF0ZSA9IHRyYW5zYWN0aW9uLmdldCgnZGF0ZScpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRyYW5zYWN0aW9uc1xufVxuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBkYXRlcy5jYWxsKHRoaXMpLmNocm9ub2xvZ2ljYWwoKVxuXG4gIGZ1bmN0aW9uIGRhdGVzICgpIHtcbiAgICB2YXIgZGF0ZXMgPSB0aGlzLm1hcChmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5nZXQoJ3RyYW5zYWN0aW9uRGF0ZScpXG4gICAgfSlcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uRGF0ZXMoZGF0ZXMpXG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259IFRoZSBmaXJzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzWzBdXG59XG5cbi8qKlxuICogQHJldHVybnMge1RyYW5zYWN0aW9ufSBUaGUgbGFzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIHRyYW5zYWN0aW9uIGF0dHJpYnV0ZSBhcnJheXNcbiAqL1xuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoa2V5cykge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHRyYW5zYWN0aW9uKSB7IHJldHVybiB0cmFuc2FjdGlvbi50b0FycmF5KGtleXMpIH0pXG59XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBmb3JtYXR0ZWQgdHJhbnNhY3Rpb24gb2JqZWN0c1xuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uICh0cmFuc2FjdGlvbikgeyByZXR1cm4gdHJhbnNhY3Rpb24udG9KU09OKGtleXMpIH0pXG59XG5cbi8qKlxuICogQWRkcyB0aGUgcHJvdG90eXBlIG1ldGhvZHMgdG8gdHJhbnNhY3Rpb25zIGFycmF5IHRvIGFwcGVhciBsaWtlIGluaGVyaXRhbmNlXG4gKiBAcHJpdmF0ZVxuICovXG5cblRyYW5zYWN0aW9ucy5faW5qZWN0UHJvdG90eXBlTWV0aG9kcyA9IGZ1bmN0aW9uIChhcnJheSkge1xuICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5wcm90b3R5cGUpIHtcbiAgICBpZiAodGhpcy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgYXJyYXlbbWV0aG9kXSA9IHRoaXMucHJvdG90eXBlW21ldGhvZF1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbnNcbiJdfQ==
