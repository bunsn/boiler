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
  return number ? number : null
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
 * Converts a table node to a 2D array
 */

function tableToArray (table, options) {
  options = options || {}
  var processRow = options.processRow || id
  var processCell = options.processCell || id

  return map(table.querySelectorAll('tbody tr'), function (tr, rowIndex, rows) {
    var row = map(tr.cells, function (node, cellIndex, cells) {
      return processCell(nodeText(node), cellIndex, cells, node)
    })

    return processRow(row, rowIndex, rows, tr)
  })
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

module.exports = tableToArray

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
var tableToArray = require('./lib/table-to-array')
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

  // Convert table to array of transactions
  var transactions = tableToArray(this.table, {
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

},{"./lib/result":5,"./lib/table-to-array":6,"./lib/weld":7,"./transaction":11,"./transactions":12}],9:[function(require,module,exports){
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
  return paidIn ? paidIn : -paidOut
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXIuanMiLCJsaWIvbnVtYmVyL21ha2UtbnVtYmVyLmpzIiwibGliL3BhcnNlLWRhdGUuanMiLCJsaWIvcmVzdWx0LmpzIiwibGliL3RhYmxlLXRvLWFycmF5LmpzIiwibGliL3dlbGQuanMiLCJzdGF0ZW1lbnQuanMiLCJ0cmFuc2FjdGlvbi1kYXRlLmpzIiwidHJhbnNhY3Rpb24tZGF0ZXMuanMiLCJ0cmFuc2FjdGlvbi5qcyIsInRyYW5zYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3N0YXRlbWVudCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZXN0U3RhdGVtZW50RGVmaW5pdGlvbjogZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHN0YXRlbWVudCA9IG5ldyBTdGF0ZW1lbnQoZGVmaW5pdGlvbilcbiAgICAgIHZhciB0cmFuc2FjdGlvbnMgPSBzdGF0ZW1lbnQudHJhbnNhY3Rpb25zXG4gICAgICB2YXIgbGFiZWwgPSAndHJhbnNhY3Rpb24nICsgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJylcbiAgICAgIHZhciBzZXBhcmF0b3IgPSAnPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSdcblxuICAgICAgY29uc29sZS5sb2coc2VwYXJhdG9yKVxuICAgICAgY29uc29sZS5sb2coJ0JvaWxlcjogJyArIHN0YXRlbWVudC5uYW1lKCkpXG4gICAgICBjb25zb2xlLmxvZyh0cmFuc2FjdGlvbnMubGVuZ3RoICsgJyAnICsgbGFiZWwgKyAnIHBhcnNlZCcpXG5cbiAgICAgIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IHRyYW5zYWN0aW9uOicsIHRyYW5zYWN0aW9ucy5maXJzdCgpLnRvSlNPTigpKVxuICAgICAgICBjb25zb2xlLmxvZygnTGFzdCB0cmFuc2FjdGlvbjonLCB0cmFuc2FjdGlvbnMubGFzdCgpLnRvSlNPTigpKVxuICAgICAgfSBlbHNlIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZygnVHJhbnNhY3Rpb246JywgdHJhbnNhY3Rpb25zLmZpcnN0KCkpXG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhzZXBhcmF0b3IpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb3VsZCBub3QgY3JlYXRlIFN0YXRlbWVudDogJyArIGVycm9yLm1lc3NhZ2UpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgbWFrZU51bWJlciA9IHJlcXVpcmUoJy4vbWFrZS1udW1iZXInKVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IG5vbi1udW1lcmljYWwgc3ltYm9scyBhbmQgcmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUuXG4gKiBVc2VmdWwgZm9yIGNvbnZlcnRpbmcgbnVtYmVycyBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gKiBlLmcuIFwiLcKjMyw0MjYuNzJcIiBjb252ZXJ0cyB0byAzNDI2LjcyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWFrZUFic29sdXRlTnVtYmVyICh2YWx1ZSkge1xuICB2YXIgbnVtYmVyID0gbWFrZU51bWJlcih2YWx1ZSlcbiAgaWYgKG51bWJlciA9PSBudWxsKSByZXR1cm4gbnVsbFxuICByZXR1cm4gTWF0aC5hYnMobnVtYmVyKVxufVxuIiwiLyoqXG4gKiBSZW1vdmVzIGFueSBub24tbnVtZXJpY2FsIHN5bWJvbHMuXG4gKiBVc2VmdWwgZm9yIGNvbnZlcnRpbmcgbnVtYmVycyBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gKiBlLmcuIFwiLcKjMyw0MjYuNzJcIiBjb252ZXJ0cyB0byAtMzQyNi43MlxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1ha2VOdW1iZXIgKHZhbHVlKSB7XG4gIHZhciBudW1iZXIgPSBOdW1iZXIoU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXlxcZFxcLi1dL2csICcnKSlcbiAgcmV0dXJuIG51bWJlciA/IG51bWJlciA6IG51bGxcbn1cbiIsInZhciBtb250aEZvcm1hdHMgPSB7XG4gIE1NTTogWydqYW4nLCAnZmViJywgJ21hcicsICdhcHInLCAnbWF5JywgJ2p1bicsICdqdWwnLCAnYXVnJywgJ3NlcCcsICdvY3QnLCAnbm92JywgJ2RlYyddLFxuICBNTU1NOiBbJ2phbnVhcnknLCAnZmVicnVhcnknLCAnbWFyY2gnLCAnYXByaWwnLCAnbWF5JywgJ2p1bmUnLCAnanVseScsICdhdWd1c3QnLCAnc2VwdGVtYmVyJywgJ29jdG9iZXInLCAnbm92ZW1iZXInLCAnZGVjZW1iZXInXVxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCkge1xuICB2YXIgZm9ybWF0UGFydHMgPSBmb3JtYXQubWF0Y2goLyhEezEsMn0pfChNezEsNH0pfChZezIsNH0pL2cpXG4gIHZhciBkYXRlUmVnZXggPSBSZWdFeHAoZm9ybWF0LnJlcGxhY2UoL0REPy8sICcoXFxcXGRcXFxcZD8pJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvTXszLDR9LywgJyhbYS16QS1aXXszLH0pJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvTU0/LywgJyhcXFxcZFxcXFxkPyknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9ZezIsNH0vLCAnKFxcXFxkezIsNH0pJykpXG4gIHZhciBkYXRlUGFydHMgPSBkYXRlU3RyaW5nLm1hdGNoKGRhdGVSZWdleClcblxuICBpZiAoZGF0ZVBhcnRzKSB7XG4gICAgZGF0ZVBhcnRzID0gZGF0ZVBhcnRzLnNwbGljZSgxKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHBhcnNlOiBgJyArIGRhdGVTdHJpbmcgKyAnYCB3aXRoIGZvcm1hdDogYCcgKyBmb3JtYXQgKyAnYCcpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYXJ0SW5kZXggKHJlZ2V4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmb3JtYXRQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlZ2V4LnRlc3QoZm9ybWF0UGFydHNbaV0pKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHZhciBkYXRlID0gZGF0ZVBhcnRzW2dldFBhcnRJbmRleCgvRC8pXVxuXG4gIC8vIEdldCBtb250aCBwYXJ0IGFuZCBjb252ZXJ0IHRvIG51bWJlciBjb21wYXRpYmxlIHdpdGggYERhdGVgXG5cbiAgdmFyIG1vbnRoID0gKGZ1bmN0aW9uIGdldE1vbnRoICgpIHtcbiAgICB2YXIgaSA9IGdldFBhcnRJbmRleCgvTS8pXG4gICAgdmFyIG1vbnRoRm9ybWF0ID0gZm9ybWF0UGFydHNbaV1cbiAgICB2YXIgZGF0ZVBhcnQgPSBkYXRlUGFydHNbaV0udG9Mb3dlckNhc2UoKVxuICAgIHZhciBtb250aFxuXG4gICAgaWYgKG1vbnRoRm9ybWF0Lmxlbmd0aCA+IDIpIHtcbiAgICAgIG1vbnRoID0gbW9udGhGb3JtYXRzW21vbnRoRm9ybWF0XS5pbmRleE9mKGRhdGVQYXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBtb250aCA9IE51bWJlcihkYXRlUGFydCkgLSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG1vbnRoXG4gIH0pKClcblxuICAvLyBHZXQgeWVhciBwYXJ0IGFuZCBjb252ZXJ0IHRvIG51bWJlciBjb21wYXRpYmxlIHdpdGggYERhdGVgXG5cbiAgdmFyIHllYXIgPSAoZnVuY3Rpb24gZ2V0WWVhciAoKSB7XG4gICAgdmFyIHllYXIgPSBkYXRlUGFydHNbZ2V0UGFydEluZGV4KC9ZLyldXG5cbiAgICBpZiAoeWVhciAmJiAoeWVhci5sZW5ndGggPT09IDIpKSB5ZWFyID0gJzIwJyArIHllYXJcblxuICAgIHJldHVybiB5ZWFyXG4gIH0pKClcblxuICByZXR1cm4geyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRhdGU6IGRhdGUgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlRGF0ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJykgPyBvYmplY3QuY2FsbChvYmplY3QpIDogb2JqZWN0XG59XG4iLCIvKipcbiAqIENvbnZlcnRzIGEgdGFibGUgbm9kZSB0byBhIDJEIGFycmF5XG4gKi9cblxuZnVuY3Rpb24gdGFibGVUb0FycmF5ICh0YWJsZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcHJvY2Vzc1JvdyA9IG9wdGlvbnMucHJvY2Vzc1JvdyB8fCBpZFxuICB2YXIgcHJvY2Vzc0NlbGwgPSBvcHRpb25zLnByb2Nlc3NDZWxsIHx8IGlkXG5cbiAgcmV0dXJuIG1hcCh0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCd0Ym9keSB0cicpLCBmdW5jdGlvbiAodHIsIHJvd0luZGV4LCByb3dzKSB7XG4gICAgdmFyIHJvdyA9IG1hcCh0ci5jZWxscywgZnVuY3Rpb24gKG5vZGUsIGNlbGxJbmRleCwgY2VsbHMpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzQ2VsbChub2RlVGV4dChub2RlKSwgY2VsbEluZGV4LCBjZWxscywgbm9kZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb2Nlc3NSb3cocm93LCByb3dJbmRleCwgcm93cywgdHIpXG4gIH0pXG59XG5cbi8qKlxuICogU3F1YXNoZWQgYW5kIHRyaW1tZWQgbm9kZSB0ZXh0IGNvbnRlbnRcbiAqL1xuXG5mdW5jdGlvbiBub2RlVGV4dCAobm9kZSkge1xuICByZXR1cm4gc3F1YXNoV2hpdGVzcGFjZShub2RlLnRleHRDb250ZW50KVxuXG4gIGZ1bmN0aW9uIHNxdWFzaFdoaXRlc3BhY2UgKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzezIsfS9nLCAnICcpLnRyaW0oKVxuICB9XG59XG5cbi8qKlxuICogbWFwIGZvciBOb2RlTGlzdHNcbiAqL1xuXG5mdW5jdGlvbiBtYXAgKGFycmF5LCBlbnVtZXJhdG9yKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyYXksIGVudW1lcmF0b3IpXG59XG5cbi8qKlxuICogSWRlbnRpdHkgZnVuY3Rpb25cbiAqIEByZXR1cm5zIEl0cyBpbnB1dCFcbiAqL1xuXG5mdW5jdGlvbiBpZCAoeCkgeyByZXR1cm4geCB9XG5cbm1vZHVsZS5leHBvcnRzID0gdGFibGVUb0FycmF5XG4iLCIvKipcbiAqIE1hcHMga2V5cyB0byB2YWx1ZXNcbiAqIEBwYXJhbSB7QXJyYXl9IGtleXMgLSBBbiBhcnJheSBvZiBrZXlzXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgLSBBbiBhcnJheSBvZiByYXcgdmFsdWVzXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHdlbGQgKGtleXMsIHZhbHVlcykge1xuICB2YXIgb2JqZWN0ID0ge31cbiAgZm9yICh2YXIgaSA9IGtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIG9iamVjdFtrZXlzW2ldXSA9IHZhbHVlc1tpXVxuICByZXR1cm4gb2JqZWN0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2VsZFxuIiwidmFyIHJlc3VsdCA9IHJlcXVpcmUoJy4vbGliL3Jlc3VsdCcpXG52YXIgdGFibGVUb0FycmF5ID0gcmVxdWlyZSgnLi9saWIvdGFibGUtdG8tYXJyYXknKVxudmFyIHdlbGQgPSByZXF1aXJlKCcuL2xpYi93ZWxkJylcbnZhciBUcmFuc2FjdGlvbiA9IHJlcXVpcmUoJy4vdHJhbnNhY3Rpb24nKVxudmFyIFRyYW5zYWN0aW9ucyA9IHJlcXVpcmUoJy4vdHJhbnNhY3Rpb25zJylcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgU3RhdGVtZW50XG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzIC0gVXN1YWxseSBhIHN0YXRlbWVudCBkZWZpbml0aW9uXG4gKi9cblxuZnVuY3Rpb24gU3RhdGVtZW50IChhdHRyaWJ1dGVzKSB7XG4gIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgaWYgKGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoa2V5KSkgdGhpc1trZXldID0gcmVzdWx0KGF0dHJpYnV0ZXNba2V5XSlcbiAgfVxuXG4gIC8vIENvbnZlcnQgdGFibGUgdG8gYXJyYXkgb2YgdHJhbnNhY3Rpb25zXG4gIHZhciB0cmFuc2FjdGlvbnMgPSB0YWJsZVRvQXJyYXkodGhpcy50YWJsZSwge1xuICAgIHByb2Nlc3NSb3c6IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVRyYW5zYWN0aW9uKHdlbGQodGhpcy5jb2x1bW5zLCByb3cpKVxuICAgIH0uYmluZCh0aGlzKVxuICB9KVxuICB0aGlzLnRyYW5zYWN0aW9ucyA9IG5ldyBUcmFuc2FjdGlvbnModHJhbnNhY3Rpb25zLCB0aGlzKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB0cmFuc2FjdGlvbiBmcm9tIGFuIG9iamVjdCBvZiBhdHRyaWJ1dGVzLlxuICogQHJldHVybnMge1RyYW5zYWN0aW9ufVxuICovXG5cblN0YXRlbWVudC5wcm90b3R5cGUuY3JlYXRlVHJhbnNhY3Rpb24gPSBmdW5jdGlvbiAoYXR0cmlidXRlcykge1xuICBhdHRyaWJ1dGVzLmRhdGVTdHJpbmcgPSBhdHRyaWJ1dGVzLmRhdGVcbiAgYXR0cmlidXRlcy5kYXRlRm9ybWF0ID0gdGhpcy5kYXRlRm9ybWF0XG4gIGRlbGV0ZSBhdHRyaWJ1dGVzLmRhdGVcbiAgcmV0dXJuIG5ldyBUcmFuc2FjdGlvbihhdHRyaWJ1dGVzKVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBzdGF0ZW1lbnQgYmFzZWQgb24gdGhlIHN0YXRlbWVudCBkYXRlXG4gKi9cblxuU3RhdGVtZW50LnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGFiZWwgPSB0aGlzLmluc3RpdHV0aW9uICsgJyBTdGF0ZW1lbnQnXG5cbiAgaWYgKHRoaXMudHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgIHJldHVybiBsYWJlbCArICcgJyArIHRoaXMudHJhbnNhY3Rpb25zLmxhc3QoKS5nZXRGb3JtYXR0ZWQoJ2RhdGUnKVxuICB9XG4gIHJldHVybiBsYWJlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlbWVudFxuIiwidmFyIHBhcnNlRGF0ZSA9IHJlcXVpcmUoJy4vbGliL3BhcnNlLWRhdGUnKVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0cmFuc2FjdGlvbiBkYXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25EYXRlIChkYXRlU3RyaW5nLCBmb3JtYXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIHBhcnNlZCA9IHBhcnNlRGF0ZShkYXRlU3RyaW5nLCBmb3JtYXQpXG5cbiAgdGhpcy55ZWFyID0gcGFyc2VkLnllYXJcbiAgdGhpcy5tb250aCA9IHBhcnNlZC5tb250aFxuICB0aGlzLmRhdGUgPSBwYXJzZWQuZGF0ZVxuXG4gIGlmICghdGhpcy55ZWFyICYmIG9wdGlvbnMuc3VjY2VlZGluZ0RhdGUpIHtcbiAgICB0aGlzLnllYXIgPSB0aGlzLmNhbGN1bGF0ZVllYXIob3B0aW9ucy5zdWNjZWVkaW5nRGF0ZSlcbiAgfVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtEYXRlfSBBIG5hdGl2ZSBEYXRlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2FjdGlvbiBkYXRlXG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlLnByb3RvdHlwZS50b0RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghRGF0ZS5wYXJzZSh0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF0ZSkpIHJldHVybiBudWxsXG4gIHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF0ZSlcbn1cblxuLyoqXG4gKiBVc2VzIHRoZSBzdWNjZWVkaW5nIGRhdGUgdG8gZGV0ZXJtaW5lIHRoZSB0cmFuc2FjdGlvbiB5ZWFyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cblRyYW5zYWN0aW9uRGF0ZS5wcm90b3R5cGUuY2FsY3VsYXRlWWVhciA9IGZ1bmN0aW9uIChzdWNjZWVkaW5nRGF0ZSkge1xuICB2YXIgeWVhciA9IHN1Y2NlZWRpbmdEYXRlLmdldEZ1bGxZZWFyKClcblxuICAvLyBEZWMgLSBKYW5cbiAgaWYgKHN1Y2NlZWRpbmdEYXRlLmdldE1vbnRoKCkgPT09IDAgJiYgdGhpcy5tb250aCA9PT0gMTEpIHllYXItLVxuXG4gIHJldHVybiB5ZWFyXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNhY3Rpb25EYXRlXG4iLCIvKipcbiAqIFJlcHJlc2VudHMgYSBjb2xsZWN0aW9uIG9mIHRyYW5zYWN0aW9uIGRhdGVzXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBkYXRlcyAtIEFuIGFycmF5IG9mIG9iamVjdHMgaW4gdGhlIGZvcm0geyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRhdGU6IGRhdGUgfVxuICovXG5cbmZ1bmN0aW9uIFRyYW5zYWN0aW9uRGF0ZXMgKGRhdGVzKSB7XG4gIHRoaXMuZGF0ZXMgPSBkYXRlc1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgZGF0ZXMgYXJlIGNocm9ub2xvZ2ljYWwgb3Igbm90XG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGVzLnByb3RvdHlwZS5jaHJvbm9sb2dpY2FsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdW5pcSA9IHRoaXMudW5pcSgpXG4gIGlmICh1bmlxLmxlbmd0aCA8IDIpIHJldHVybiB0cnVlXG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZSh1bmlxWzBdLCB1bmlxWzFdKSA+PSAwXG59XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5fSBUaGUgdW5pcXVlIGRhdGVzXG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlcy5wcm90b3R5cGUudW5pcSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHVuaXFzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGF0ZSA9IHRoaXMuZGF0ZXNbaV1cbiAgICBpZiAoaW5VbmlxcyhkYXRlKSkgY29udGludWVcbiAgICB1bmlxcy5wdXNoKGRhdGUpXG4gIH1cblxuICByZXR1cm4gdW5pcXNcblxuICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgYSBkYXRlIGFscmVhZHkgZXhpc3RzIGluIHRoZSB1bmlxcyBhcnJheVxuICBmdW5jdGlvbiBpblVuaXFzIChkKSB7XG4gICAgcmV0dXJuIHVuaXFzLnNvbWUoZnVuY3Rpb24gKHUpIHtcbiAgICAgIHJldHVybiB1LnllYXIgPT09IGQueWVhciAmJiB1Lm1vbnRoID09PSBkLm1vbnRoICYmIHUuZGF0ZSA9PT0gZC5kYXRlXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIENvbXBhcmVzIHR3byBkYXRlcyB0byB0ZXN0IGNocm9ub2xvZ3lcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IDA6IGEgPT0gYiwgMTogYSA+IGIsIC0xOiBhIDwgYlxuICovXG5cblRyYW5zYWN0aW9uRGF0ZXMucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiAoYSwgYikge1xuICAvLyBJZiBubyB5ZWFyLCBhbmQgZGF0ZXMgZ28gZnJvbSBEZWMgLSBKYW4sIGFzc3VtZSBEZWMgZGF0ZSBpcyBvbGRlclxuICBpZiAoKCFhLnllYXIgfHwgIWIueWVhcikgJiYgYS5tb250aCA9PT0gMTEgJiYgYi5tb250aCA9PT0gMCkgcmV0dXJuIDFcblxuICBpZiAoYS55ZWFyID09PSBiLnllYXIpIHtcbiAgICBpZiAoYS5tb250aCA9PT0gYi5tb250aCkge1xuICAgICAgaWYgKGEuZGF0ZSA+IGIuZGF0ZSkgcmV0dXJuIC0xXG4gICAgICBpZiAoYS5kYXRlIDwgYi5kYXRlKSByZXR1cm4gMVxuICAgICAgcmV0dXJuIDBcbiAgICB9XG5cbiAgICBpZiAoYS5tb250aCA+IGIubW9udGgpIHJldHVybiAtMVxuICAgIGlmIChhLm1vbnRoIDwgYi5tb250aCkgcmV0dXJuIDFcbiAgfVxuICBpZiAoYS55ZWFyID4gYi55ZWFyKSByZXR1cm4gLTFcbiAgaWYgKGEueWVhciA8IGIueWVhcikgcmV0dXJuIDFcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbkRhdGVzXG4iLCJ2YXIgbWFrZU51bWJlciA9IHJlcXVpcmUoJy4vbGliL251bWJlci9tYWtlLW51bWJlcicpXG52YXIgbWFrZUFic29sdXRlTnVtYmVyID0gcmVxdWlyZSgnLi9saWIvbnVtYmVyL21ha2UtYWJzb2x1dGUtbnVtYmVyJylcbnZhciBUcmFuc2FjdGlvbkRhdGUgPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9uLWRhdGUnKVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgdHJhbnNhY3Rpb24uXG4gKiBHZXR0ZXJzIGFuZCBzZXR0ZXJzIGFyZSB1c2VkIHRvIHRyYW5zZm9ybSBhbmQgZm9ybWF0IHZhbHVlcy4gQWxzbyByZXNwb25zaWJsZVxuICogZm9yIGNhbGN1bGF0aW5nIGFtb3VudHMgYW5kIGRhdGVzIHdoZW4gbWlzc2luZyBvciBpbnZhbGlkLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlc1xuICovXG5cbmZ1bmN0aW9uIFRyYW5zYWN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gIHRoaXMuYXR0cmlidXRlcyA9IHt9XG5cbiAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB0aGlzLnNldChrZXksIGF0dHJpYnV0ZXNba2V5XSlcbiAgfVxuXG4gIGlmICghdGhpcy5nZXQoJ2RhdGUnKSkgdGhpcy5zZXREYXRlKClcbiAgaWYgKCF0aGlzLmdldCgnYW1vdW50JykpIHRoaXMuc2V0QW1vdW50KClcbn1cblxuLyoqXG4gKiBGdW5jdGlvbnMgdGhhdCB0cmFuc2Zvcm0gYXR0cmlidXRlcyBhcyB0aGV5IGFyZSBzZXRcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUudHJhbnNmb3JtZXJzID0ge1xuICBhbW91bnQ6IG1ha2VOdW1iZXIsXG4gIGJhbGFuY2U6IG1ha2VOdW1iZXIsXG4gIHBhaWRJbjogbWFrZUFic29sdXRlTnVtYmVyLFxuICBwYWlkT3V0OiBtYWtlQWJzb2x1dGVOdW1iZXIsXG4gIGRhdGU6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm4gZGF0ZVxuXG4gICAgLy8gQ29udmVydCB0byBHTVQgdG8gZW5zdXJlIGNvcnJlY3QgSlNPTiB2YWx1ZXNcbiAgICBkYXRlLnNldEhvdXJzKGRhdGUuZ2V0SG91cnMoKSAtIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAvIDYwKVxuICAgIHJldHVybiBkYXRlXG4gIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbnMgdGhhdCBmb3JtYXQgYXR0cmlidXRlcyB3aGVuIHJldHJpZXZlZCB3aXRoIGBnZXRGb3JtYXR0ZWRgXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLmZvcm1hdHRlcnMgPSB7XG4gIGRhdGU6IGZvcm1hdERhdGVcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGFuZCBzZXRzIHRoZSBnaXZlbiBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgLSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlXG4gKiBAcGFyYW0gdmFsdWUgLSBUaGUgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxuICovXG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB2YXIgdHJhbnNmb3JtZXIgPSB0aGlzLnRyYW5zZm9ybWVyc1trZXldIHx8IGlkRnVuY3Rpb25cbiAgdGhpcy5hdHRyaWJ1dGVzW2tleV0gPSB0cmFuc2Zvcm1lcih2YWx1ZSlcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB0aGUgc3RvcmVkIGF0dHJpYnV0ZVxuICovXG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNba2V5XVxufVxuXG4vKipcbiAqIEdldCBhIHZhbHVlIGZvcm1hdHRlZCBieSB0aGUgY29ycmVzcG9uZGluZyBmb3JtYXR0ZXJcbiAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZXR1cm5cbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLmdldEZvcm1hdHRlZCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdmFyIGZvcm1hdHRlciA9IHRoaXMuZm9ybWF0dGVyc1trZXldIHx8IGlkRnVuY3Rpb25cbiAgcmV0dXJuIGZvcm1hdHRlcih0aGlzLmdldChrZXkpKVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGtleXMgb3IgYWxsIGZvcm1hdHRlZFxuICogYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7QXJyYXl9IGtleXMgLSBBbiBhcnJheSBvZiBhdHRyaWJ1dGUga2V5c1xuICogQHJldHVybnMge0FycmF5fSAtIEFuIGFycmF5IG9mIGZvcm1hdHRlZCBhdHRyaWJ1dGVzXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoa2V5cykge1xuICBrZXlzID0ga2V5cyB8fCBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG4gIHJldHVybiBrZXlzLm1hcCh0aGlzLmdldEZvcm1hdHRlZC5iaW5kKHRoaXMpKVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IG9mIGZvcm1hdHRlZCB2YWx1ZXMgb2YgdGhlIGdpdmVuIGtleXMgb3IgYWxsIGZvcm1hdHRlZFxuICogYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7QXJyYXl9IGtleXMgLSBBbiBhcnJheSBvZiBhdHRyaWJ1dGUga2V5c1xuICogQHJldHVybnMge0FycmF5fSAtIEFuIGFycmF5IG9mIGZvcm1hdHRlZCBhdHRyaWJ1dGVzXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gIGtleXMgPSBrZXlzIHx8IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcbiAgdmFyIG9iamVjdCA9IHt9XG5cbiAgZm9yICh2YXIgaSA9IGtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgIG9iamVjdFtrZXldID0gdGhpcy5nZXRGb3JtYXR0ZWQoa2V5KVxuICB9XG5cbiAgcmV0dXJuIG9iamVjdFxufVxuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuc2V0RGF0ZSA9IGZ1bmN0aW9uIChhdHRycykge1xuICBhdHRycyA9IGF0dHJzIHx8IHt9XG4gIHZhciBkYXRlU3RyaW5nID0gYXR0cnMuZGF0ZVN0cmluZyB8fCB0aGlzLmdldCgnZGF0ZVN0cmluZycpXG4gIHZhciBkYXRlRm9ybWF0ID0gYXR0cnMuZGF0ZUZvcm1hdCB8fCB0aGlzLmdldCgnZGF0ZUZvcm1hdCcpXG4gIHZhciBzdWNjZWVkaW5nRGF0ZSA9IGF0dHJzLnN1Y2NlZWRpbmdEYXRlXG5cbiAgdmFyIHRyYW5zYWN0aW9uRGF0ZSA9IG5ldyBUcmFuc2FjdGlvbkRhdGUoZGF0ZVN0cmluZywgZGF0ZUZvcm1hdCwge1xuICAgIHN1Y2NlZWRpbmdEYXRlOiBzdWNjZWVkaW5nRGF0ZVxuICB9KVxuICB0aGlzLnNldCgndHJhbnNhY3Rpb25EYXRlJywgdHJhbnNhY3Rpb25EYXRlKVxuICB0aGlzLnNldCgnZGF0ZScsIHRyYW5zYWN0aW9uRGF0ZS50b0RhdGUoKSlcbn1cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnNldEFtb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHBhaWRJbiA9IHRoaXMuZ2V0KCdwYWlkSW4nKVxuICB2YXIgcGFpZE91dCA9IHRoaXMuZ2V0KCdwYWlkT3V0JylcblxuICB0aGlzLnNldCgnYW1vdW50JywgY2FsY3VsYXRlQW1vdW50KHBhaWRJbiwgcGFpZE91dCkpXG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUFtb3VudCAocGFpZEluLCBwYWlkT3V0KSB7XG4gIHJldHVybiBwYWlkSW4gPyBwYWlkSW4gOiAtcGFpZE91dFxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlICh2YWx1ZSkge1xuICB2YXIgeXl5eSA9IHZhbHVlLmdldEZ1bGxZZWFyKClcbiAgdmFyIG1tID0gcGFkWmVyb2VzKHZhbHVlLmdldE1vbnRoKCkgKyAxKVxuICB2YXIgZGQgPSBwYWRaZXJvZXModmFsdWUuZ2V0RGF0ZSgpKVxuXG4gIHJldHVybiBbeXl5eSwgbW0sIGRkXS5qb2luKCctJylcblxuICBmdW5jdGlvbiBwYWRaZXJvZXMgKG51bWJlcikge1xuICAgIHJldHVybiBTdHJpbmcoJzAwJyArIG51bWJlcikuc2xpY2UoLTIpXG4gIH1cbn1cblxuZnVuY3Rpb24gaWRGdW5jdGlvbiAoeCkgeyByZXR1cm4geCB9XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNhY3Rpb25cbiIsInZhciBUcmFuc2FjdGlvbkRhdGVzID0gcmVxdWlyZSgnLi90cmFuc2FjdGlvbi1kYXRlcycpXG5cbi8qKlxuICogQW4gYXJyYXktbGlrZSBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBjb2xsZWN0aW9uIG9mIHRyYW5zYWN0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSB0cmFuc2FjdGlvbnMgLSBBbiBhcnJheSBvZiBUcmFuc2FjdGlvbiBvYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhdGVtZW50IC0gVGhlIHBhcmVudCBzdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtBcnJheX0gLSBBbiBhcnJheSBvZiB0cmFuc2FjdGlvbnMgd2l0aCBjb252ZW5pZW5jZSBtZXRob2RzXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25zICh0cmFuc2FjdGlvbnMsIHN0YXRlbWVudCkge1xuICBUcmFuc2FjdGlvbnMuX2luamVjdFByb3RvdHlwZU1ldGhvZHModHJhbnNhY3Rpb25zKVxuXG4gIC8qKlxuICAgKiBTb21lIGZpbmFuY2lhbCBpbnN0aXR1dGlvbnMgb21pdCB0aGUgeWVhciBwYXJ0IGluIHRoZWlyIGRhdGUgY2VsbHMuXG4gICAqIFRoaXMgd29ya2Fyb3VuZCBjYWxjdWxhdGVzIHRoZSB5ZWFyIGZvciBlYWNoIHRyYW5zYWN0aW9uIGFmZmVjdGVkLlxuICAgKi9cblxuICBpZiAoIS9ZezIsfS8udGVzdChzdGF0ZW1lbnQuZGF0ZUZvcm1hdCkpIHtcbiAgICBpZiAoIXRyYW5zYWN0aW9ucy5jaHJvbm9sb2dpY2FsKCkpIHRyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucy5yZXZlcnNlKClcblxuICAgIHZhciBzdWNjZWVkaW5nRGF0ZSA9IHN0YXRlbWVudC5kYXRlXG4gICAgZm9yICh2YXIgaSA9IHRyYW5zYWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb25zW2ldXG4gICAgICB0cmFuc2FjdGlvbi5zZXREYXRlKHsgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlIH0pXG4gICAgICBzdWNjZWVkaW5nRGF0ZSA9IHRyYW5zYWN0aW9uLmdldCgnZGF0ZScpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRyYW5zYWN0aW9uc1xufVxuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBkYXRlcy5jYWxsKHRoaXMpLmNocm9ub2xvZ2ljYWwoKVxuXG4gIGZ1bmN0aW9uIGRhdGVzICgpIHtcbiAgICB2YXIgZGF0ZXMgPSB0aGlzLm1hcChmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5nZXQoJ3RyYW5zYWN0aW9uRGF0ZScpXG4gICAgfSlcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uRGF0ZXMoZGF0ZXMpXG4gIH1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259IFRoZSBmaXJzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzWzBdXG59XG5cbi8qKlxuICogQHJldHVybnMge1RyYW5zYWN0aW9ufSBUaGUgbGFzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIHRyYW5zYWN0aW9uIGF0dHJpYnV0ZSBhcnJheXNcbiAqL1xuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoa2V5cykge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHRyYW5zYWN0aW9uKSB7IHJldHVybiB0cmFuc2FjdGlvbi50b0FycmF5KGtleXMpIH0pXG59XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBmb3JtYXR0ZWQgdHJhbnNhY3Rpb24gb2JqZWN0c1xuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uICh0cmFuc2FjdGlvbikgeyByZXR1cm4gdHJhbnNhY3Rpb24udG9KU09OKGtleXMpIH0pXG59XG5cbi8qKlxuICogQWRkcyB0aGUgcHJvdG90eXBlIG1ldGhvZHMgdG8gdHJhbnNhY3Rpb25zIGFycmF5IHRvIGFwcGVhciBsaWtlIGluaGVyaXRhbmNlXG4gKiBAcHJpdmF0ZVxuICovXG5cblRyYW5zYWN0aW9ucy5faW5qZWN0UHJvdG90eXBlTWV0aG9kcyA9IGZ1bmN0aW9uIChhcnJheSkge1xuICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcy5wcm90b3R5cGUpIHtcbiAgICBpZiAodGhpcy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgYXJyYXlbbWV0aG9kXSA9IHRoaXMucHJvdG90eXBlW21ldGhvZF1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbnNcbiJdfQ==
