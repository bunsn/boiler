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
  MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  MMMM: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}

function parseDate (dateString, format) {
  var formatParts = format.split(/[^DMY]+/)
  var dateRegex = RegExp(format.replace(/DD?/, '(\\d\\d?)')
                               .replace(/M{3,4}/, '(\\w{3,})')
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
    var datePart = dateParts[i]
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXIuanMiLCJsaWIvbnVtYmVyL21ha2UtbnVtYmVyLmpzIiwibGliL3BhcnNlLWRhdGUuanMiLCJsaWIvcmVzdWx0LmpzIiwibGliL3RhYmxlLXRvLWFycmF5LmpzIiwibGliL3dlbGQuanMiLCJzdGF0ZW1lbnQuanMiLCJ0cmFuc2FjdGlvbi1kYXRlLmpzIiwidHJhbnNhY3Rpb24tZGF0ZXMuanMiLCJ0cmFuc2FjdGlvbi5qcyIsInRyYW5zYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3N0YXRlbWVudCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZXN0U3RhdGVtZW50RGVmaW5pdGlvbjogZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHN0YXRlbWVudCA9IG5ldyBTdGF0ZW1lbnQoZGVmaW5pdGlvbilcbiAgICAgIHZhciB0cmFuc2FjdGlvbnMgPSBzdGF0ZW1lbnQudHJhbnNhY3Rpb25zXG4gICAgICB2YXIgbGFiZWwgPSAndHJhbnNhY3Rpb24nICsgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJylcbiAgICAgIHZhciBzZXBhcmF0b3IgPSAnPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSdcblxuICAgICAgY29uc29sZS5sb2coc2VwYXJhdG9yKVxuICAgICAgY29uc29sZS5sb2coJ0JvaWxlcjogJyArIHN0YXRlbWVudC5uYW1lKCkpXG4gICAgICBjb25zb2xlLmxvZyh0cmFuc2FjdGlvbnMubGVuZ3RoICsgJyAnICsgbGFiZWwgKyAnIHBhcnNlZCcpXG5cbiAgICAgIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IHRyYW5zYWN0aW9uOicsIHRyYW5zYWN0aW9ucy5maXJzdCgpLnRvSlNPTigpKVxuICAgICAgICBjb25zb2xlLmxvZygnTGFzdCB0cmFuc2FjdGlvbjonLCB0cmFuc2FjdGlvbnMubGFzdCgpLnRvSlNPTigpKVxuICAgICAgfSBlbHNlIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZygnVHJhbnNhY3Rpb246JywgdHJhbnNhY3Rpb25zLmZpcnN0KCkpXG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhzZXBhcmF0b3IpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb3VsZCBub3QgY3JlYXRlIFN0YXRlbWVudDogJyArIGVycm9yLm1lc3NhZ2UpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgbWFrZU51bWJlciA9IHJlcXVpcmUoJy4vbWFrZS1udW1iZXInKVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IG5vbi1udW1lcmljYWwgc3ltYm9scyBhbmQgcmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUuXG4gKiBVc2VmdWwgZm9yIGNvbnZlcnRpbmcgbnVtYmVycyBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gKiBlLmcuIFwiLcKjMyw0MjYuNzJcIiBjb252ZXJ0cyB0byAzNDI2LjcyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWFrZUFic29sdXRlTnVtYmVyICh2YWx1ZSkge1xuICB2YXIgbnVtYmVyID0gbWFrZU51bWJlcih2YWx1ZSlcbiAgaWYgKG51bWJlciA9PSBudWxsKSByZXR1cm4gbnVsbFxuICByZXR1cm4gTWF0aC5hYnMobnVtYmVyKVxufVxuIiwiLyoqXG4gKiBSZW1vdmVzIGFueSBub24tbnVtZXJpY2FsIHN5bWJvbHMuXG4gKiBVc2VmdWwgZm9yIGNvbnZlcnRpbmcgbnVtYmVycyBmb3JtYXR0ZWQgYXMgY3VycmVuY3kuXG4gKiBlLmcuIFwiLcKjMyw0MjYuNzJcIiBjb252ZXJ0cyB0byAtMzQyNi43MlxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1ha2VOdW1iZXIgKHZhbHVlKSB7XG4gIHZhciBudW1iZXIgPSBOdW1iZXIoU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXlxcZFxcLi1dL2csICcnKSlcbiAgcmV0dXJuIG51bWJlciA/IG51bWJlciA6IG51bGxcbn1cbiIsInZhciBtb250aEZvcm1hdHMgPSB7XG4gIE1NTTogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxuICBNTU1NOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXVxufVxuXG5mdW5jdGlvbiBwYXJzZURhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCkge1xuICB2YXIgZm9ybWF0UGFydHMgPSBmb3JtYXQuc3BsaXQoL1teRE1ZXSsvKVxuICB2YXIgZGF0ZVJlZ2V4ID0gUmVnRXhwKGZvcm1hdC5yZXBsYWNlKC9ERD8vLCAnKFxcXFxkXFxcXGQ/KScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL017Myw0fS8sICcoXFxcXHd7Myx9KScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL01NPy8sICcoXFxcXGRcXFxcZD8pJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvWXsyLDR9LywgJyhcXFxcZHsyLDR9KScpKVxuICB2YXIgZGF0ZVBhcnRzID0gZGF0ZVN0cmluZy5tYXRjaChkYXRlUmVnZXgpXG5cbiAgaWYgKGRhdGVQYXJ0cykge1xuICAgIGRhdGVQYXJ0cyA9IGRhdGVQYXJ0cy5zcGxpY2UoMSlcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwYXJzZTogYCcgKyBkYXRlU3RyaW5nICsgJ2Agd2l0aCBmb3JtYXQ6IGAnICsgZm9ybWF0ICsgJ2AnKVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFydEluZGV4IChyZWdleCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9ybWF0UGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWdleC50ZXN0KGZvcm1hdFBhcnRzW2ldKSkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICB2YXIgZGF0ZSA9IGRhdGVQYXJ0c1tnZXRQYXJ0SW5kZXgoL0QvKV1cblxuICAvLyBHZXQgbW9udGggcGFydCBhbmQgY29udmVydCB0byBudW1iZXIgY29tcGF0aWJsZSB3aXRoIGBEYXRlYFxuXG4gIHZhciBtb250aCA9IChmdW5jdGlvbiBnZXRNb250aCAoKSB7XG4gICAgdmFyIGkgPSBnZXRQYXJ0SW5kZXgoL00vKVxuICAgIHZhciBtb250aEZvcm1hdCA9IGZvcm1hdFBhcnRzW2ldXG4gICAgdmFyIGRhdGVQYXJ0ID0gZGF0ZVBhcnRzW2ldXG4gICAgdmFyIG1vbnRoXG5cbiAgICBpZiAobW9udGhGb3JtYXQubGVuZ3RoID4gMikge1xuICAgICAgbW9udGggPSBtb250aEZvcm1hdHNbbW9udGhGb3JtYXRdLmluZGV4T2YoZGF0ZVBhcnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIG1vbnRoID0gTnVtYmVyKGRhdGVQYXJ0KSAtIDFcbiAgICB9XG5cbiAgICByZXR1cm4gbW9udGhcbiAgfSkoKVxuXG4gIC8vIEdldCB5ZWFyIHBhcnQgYW5kIGNvbnZlcnQgdG8gbnVtYmVyIGNvbXBhdGlibGUgd2l0aCBgRGF0ZWBcblxuICB2YXIgeWVhciA9IChmdW5jdGlvbiBnZXRZZWFyICgpIHtcbiAgICB2YXIgeWVhciA9IGRhdGVQYXJ0c1tnZXRQYXJ0SW5kZXgoL1kvKV1cblxuICAgIGlmICh5ZWFyICYmICh5ZWFyLmxlbmd0aCA9PT0gMikpIHllYXIgPSAnMjAnICsgeWVhclxuXG4gICAgcmV0dXJuIHllYXJcbiAgfSkoKVxuXG4gIHJldHVybiB7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF0ZTogZGF0ZSB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VEYXRlXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqZWN0ID09PSAnZnVuY3Rpb24nKSA/IG9iamVjdC5jYWxsKG9iamVjdCkgOiBvYmplY3Rcbn1cbiIsIi8qKlxuICogQ29udmVydHMgYSB0YWJsZSBub2RlIHRvIGEgMkQgYXJyYXlcbiAqL1xuXG5mdW5jdGlvbiB0YWJsZVRvQXJyYXkgKHRhYmxlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciBwcm9jZXNzUm93ID0gb3B0aW9ucy5wcm9jZXNzUm93IHx8IGlkXG4gIHZhciBwcm9jZXNzQ2VsbCA9IG9wdGlvbnMucHJvY2Vzc0NlbGwgfHwgaWRcblxuICByZXR1cm4gbWFwKHRhYmxlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3Rib2R5IHRyJyksIGZ1bmN0aW9uICh0ciwgcm93SW5kZXgsIHJvd3MpIHtcbiAgICB2YXIgcm93ID0gbWFwKHRyLmNlbGxzLCBmdW5jdGlvbiAobm9kZSwgY2VsbEluZGV4LCBjZWxscykge1xuICAgICAgcmV0dXJuIHByb2Nlc3NDZWxsKG5vZGVUZXh0KG5vZGUpLCBjZWxsSW5kZXgsIGNlbGxzLCBub2RlKVxuICAgIH0pXG5cbiAgICByZXR1cm4gcHJvY2Vzc1Jvdyhyb3csIHJvd0luZGV4LCByb3dzLCB0cilcbiAgfSlcbn1cblxuLyoqXG4gKiBTcXVhc2hlZCBhbmQgdHJpbW1lZCBub2RlIHRleHQgY29udGVudFxuICovXG5cbmZ1bmN0aW9uIG5vZGVUZXh0IChub2RlKSB7XG4gIHJldHVybiBzcXVhc2hXaGl0ZXNwYWNlKG5vZGUudGV4dENvbnRlbnQpXG5cbiAgZnVuY3Rpb24gc3F1YXNoV2hpdGVzcGFjZSAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9cXHN7Mix9L2csICcgJykudHJpbSgpXG4gIH1cbn1cblxuLyoqXG4gKiBtYXAgZm9yIE5vZGVMaXN0c1xuICovXG5cbmZ1bmN0aW9uIG1hcCAoYXJyYXksIGVudW1lcmF0b3IpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnJheSwgZW51bWVyYXRvcilcbn1cblxuLyoqXG4gKiBJZGVudGl0eSBmdW5jdGlvblxuICogQHJldHVybnMgSXRzIGlucHV0IVxuICovXG5cbmZ1bmN0aW9uIGlkICh4KSB7IHJldHVybiB4IH1cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJsZVRvQXJyYXlcbiIsIi8qKlxuICogTWFwcyBrZXlzIHRvIHZhbHVlc1xuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGtleXNcbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyAtIEFuIGFycmF5IG9mIHJhdyB2YWx1ZXNcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gd2VsZCAoa2V5cywgdmFsdWVzKSB7XG4gIHZhciBvYmplY3QgPSB7fVxuICBmb3IgKHZhciBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgb2JqZWN0W2tleXNbaV1dID0gdmFsdWVzW2ldXG4gIHJldHVybiBvYmplY3Rcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3ZWxkXG4iLCJ2YXIgcmVzdWx0ID0gcmVxdWlyZSgnLi9saWIvcmVzdWx0JylcbnZhciB0YWJsZVRvQXJyYXkgPSByZXF1aXJlKCcuL2xpYi90YWJsZS10by1hcnJheScpXG52YXIgd2VsZCA9IHJlcXVpcmUoJy4vbGliL3dlbGQnKVxudmFyIFRyYW5zYWN0aW9uID0gcmVxdWlyZSgnLi90cmFuc2FjdGlvbicpXG52YXIgVHJhbnNhY3Rpb25zID0gcmVxdWlyZSgnLi90cmFuc2FjdGlvbnMnKVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBTdGF0ZW1lbnRcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXMgLSBVc3VhbGx5IGEgc3RhdGVtZW50IGRlZmluaXRpb25cbiAqL1xuXG5mdW5jdGlvbiBTdGF0ZW1lbnQgKGF0dHJpYnV0ZXMpIHtcbiAgZm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICBpZiAoYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB0aGlzW2tleV0gPSByZXN1bHQoYXR0cmlidXRlc1trZXldKVxuICB9XG5cbiAgLy8gQ29udmVydCB0YWJsZSB0byBhcnJheSBvZiB0cmFuc2FjdGlvbnNcbiAgdmFyIHRyYW5zYWN0aW9ucyA9IHRhYmxlVG9BcnJheSh0aGlzLnRhYmxlLCB7XG4gICAgcHJvY2Vzc1JvdzogZnVuY3Rpb24gKHJvdykge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVHJhbnNhY3Rpb24od2VsZCh0aGlzLmNvbHVtbnMsIHJvdykpXG4gICAgfS5iaW5kKHRoaXMpXG4gIH0pXG4gIHRoaXMudHJhbnNhY3Rpb25zID0gbmV3IFRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbnMsIHRoaXMpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRyYW5zYWN0aW9uIGZyb20gYW4gb2JqZWN0IG9mIGF0dHJpYnV0ZXMuXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259XG4gKi9cblxuU3RhdGVtZW50LnByb3RvdHlwZS5jcmVhdGVUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gIGF0dHJpYnV0ZXMuZGF0ZVN0cmluZyA9IGF0dHJpYnV0ZXMuZGF0ZVxuICBhdHRyaWJ1dGVzLmRhdGVGb3JtYXQgPSB0aGlzLmRhdGVGb3JtYXRcbiAgZGVsZXRlIGF0dHJpYnV0ZXMuZGF0ZVxuICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKGF0dHJpYnV0ZXMpXG59XG5cbi8qKlxuICogQHJldHVybnMge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIHN0YXRlbWVudCBiYXNlZCBvbiB0aGUgc3RhdGVtZW50IGRhdGVcbiAqL1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYWJlbCA9IHRoaXMuaW5zdGl0dXRpb24gKyAnIFN0YXRlbWVudCdcblxuICBpZiAodGhpcy50cmFuc2FjdGlvbnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGxhYmVsICsgJyAnICsgdGhpcy50cmFuc2FjdGlvbnMubGFzdCgpLmdldEZvcm1hdHRlZCgnZGF0ZScpXG4gIH1cbiAgcmV0dXJuIGxhYmVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVtZW50XG4iLCJ2YXIgcGFyc2VEYXRlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UtZGF0ZScpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRyYW5zYWN0aW9uIGRhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBUcmFuc2FjdGlvbkRhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcGFyc2VkID0gcGFyc2VEYXRlKGRhdGVTdHJpbmcsIGZvcm1hdClcblxuICB0aGlzLnllYXIgPSBwYXJzZWQueWVhclxuICB0aGlzLm1vbnRoID0gcGFyc2VkLm1vbnRoXG4gIHRoaXMuZGF0ZSA9IHBhcnNlZC5kYXRlXG5cbiAgaWYgKCF0aGlzLnllYXIgJiYgb3B0aW9ucy5zdWNjZWVkaW5nRGF0ZSkge1xuICAgIHRoaXMueWVhciA9IHRoaXMuY2FsY3VsYXRlWWVhcihvcHRpb25zLnN1Y2NlZWRpbmdEYXRlKVxuICB9XG59XG5cbi8qKlxuICogQHJldHVybnMge0RhdGV9IEEgbmF0aXZlIERhdGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zYWN0aW9uIGRhdGVcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGUucHJvdG90eXBlLnRvRGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFEYXRlLnBhcnNlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKVxufVxuXG4vKipcbiAqIFVzZXMgdGhlIHN1Y2NlZWRpbmcgZGF0ZSB0byBkZXRlcm1pbmUgdGhlIHRyYW5zYWN0aW9uIHllYXJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlLnByb3RvdHlwZS5jYWxjdWxhdGVZZWFyID0gZnVuY3Rpb24gKHN1Y2NlZWRpbmdEYXRlKSB7XG4gIHZhciB5ZWFyID0gc3VjY2VlZGluZ0RhdGUuZ2V0RnVsbFllYXIoKVxuXG4gIC8vIERlYyAtIEphblxuICBpZiAoc3VjY2VlZGluZ0RhdGUuZ2V0TW9udGgoKSA9PT0gMCAmJiB0aGlzLm1vbnRoID09PSAxMSkgeWVhci0tXG5cbiAgcmV0dXJuIHllYXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbkRhdGVcbiIsIi8qKlxuICogUmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgdHJhbnNhY3Rpb24gZGF0ZXNcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGRhdGVzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSB7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF0ZTogZGF0ZSB9XG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25EYXRlcyAoZGF0ZXMpIHtcbiAgdGhpcy5kYXRlcyA9IGRhdGVzXG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBkYXRlcyBhcmUgY2hyb25vbG9naWNhbCBvciBub3RcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5cblRyYW5zYWN0aW9uRGF0ZXMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB1bmlxID0gdGhpcy51bmlxKClcbiAgaWYgKHVuaXEubGVuZ3RoIDwgMikgcmV0dXJuIHRydWVcblxuICByZXR1cm4gdGhpcy5jb21wYXJlKHVuaXFbMF0sIHVuaXFbMV0pID49IDBcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB1bmlxdWUgZGF0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGVzLnByb3RvdHlwZS51bmlxID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdW5pcXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkYXRlID0gdGhpcy5kYXRlc1tpXVxuICAgIGlmIChpblVuaXFzKGRhdGUpKSBjb250aW51ZVxuICAgIHVuaXFzLnB1c2goZGF0ZSlcbiAgfVxuXG4gIHJldHVybiB1bmlxc1xuXG4gIC8vIERldGVybWluZXMgd2hldGhlciBhIGRhdGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHVuaXFzIGFycmF5XG4gIGZ1bmN0aW9uIGluVW5pcXMgKGQpIHtcbiAgICByZXR1cm4gdW5pcXMuc29tZShmdW5jdGlvbiAodSkge1xuICAgICAgcmV0dXJuIHUueWVhciA9PT0gZC55ZWFyICYmIHUubW9udGggPT09IGQubW9udGggJiYgdS5kYXRlID09PSBkLmRhdGVcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIGRhdGVzIHRvIHRlc3QgY2hyb25vbG9neVxuICogQHJldHVybnMge051bWJlcn0gMDogYSA9PSBiLCAxOiBhID4gYiwgLTE6IGEgPCBiXG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlcy5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIC8vIElmIG5vIHllYXIsIGFuZCBkYXRlcyBnbyBmcm9tIERlYyAtIEphbiwgYXNzdW1lIERlYyBkYXRlIGlzIG9sZGVyXG4gIGlmICgoIWEueWVhciB8fCAhYi55ZWFyKSAmJiBhLm1vbnRoID09PSAxMSAmJiBiLm1vbnRoID09PSAwKSByZXR1cm4gMVxuXG4gIGlmIChhLnllYXIgPT09IGIueWVhcikge1xuICAgIGlmIChhLm1vbnRoID09PSBiLm1vbnRoKSB7XG4gICAgICBpZiAoYS5kYXRlID4gYi5kYXRlKSByZXR1cm4gLTFcbiAgICAgIGlmIChhLmRhdGUgPCBiLmRhdGUpIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuICAgIGlmIChhLm1vbnRoID4gYi5tb250aCkgcmV0dXJuIC0xXG4gICAgaWYgKGEubW9udGggPCBiLm1vbnRoKSByZXR1cm4gMVxuICB9XG4gIGlmIChhLnllYXIgPiBiLnllYXIpIHJldHVybiAtMVxuICBpZiAoYS55ZWFyIDwgYi55ZWFyKSByZXR1cm4gMVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zYWN0aW9uRGF0ZXNcbiIsInZhciBtYWtlTnVtYmVyID0gcmVxdWlyZSgnLi9saWIvbnVtYmVyL21ha2UtbnVtYmVyJylcbnZhciBtYWtlQWJzb2x1dGVOdW1iZXIgPSByZXF1aXJlKCcuL2xpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXInKVxudmFyIFRyYW5zYWN0aW9uRGF0ZSA9IHJlcXVpcmUoJy4vdHJhbnNhY3Rpb24tZGF0ZScpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNpbmdsZSB0cmFuc2FjdGlvbi5cbiAqIEdldHRlcnMgYW5kIHNldHRlcnMgYXJlIHVzZWQgdG8gdHJhbnNmb3JtIGFuZCBmb3JtYXQgdmFsdWVzLiBBbHNvIHJlc3BvbnNpYmxlXG4gKiBmb3IgY2FsY3VsYXRpbmcgYW1vdW50cyBhbmQgZGF0ZXMgd2hlbiBtaXNzaW5nIG9yIGludmFsaWQuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgdGhpcy5hdHRyaWJ1dGVzID0ge31cblxuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgIGlmIChhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGtleSkpIHRoaXMuc2V0KGtleSwgYXR0cmlidXRlc1trZXldKVxuICB9XG5cbiAgaWYgKCF0aGlzLmdldCgnZGF0ZScpKSB0aGlzLnNldERhdGUoKVxuICBpZiAoIXRoaXMuZ2V0KCdhbW91bnQnKSkgdGhpcy5zZXRBbW91bnQoKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IHRyYW5zZm9ybSBhdHRyaWJ1dGVzIGFzIHRoZXkgYXJlIHNldFxuICovXG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS50cmFuc2Zvcm1lcnMgPSB7XG4gIGFtb3VudDogbWFrZU51bWJlcixcbiAgYmFsYW5jZTogbWFrZU51bWJlcixcbiAgcGFpZEluOiBtYWtlQWJzb2x1dGVOdW1iZXIsXG4gIHBhaWRPdXQ6IG1ha2VBYnNvbHV0ZU51bWJlcixcbiAgZGF0ZTogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybiBkYXRlXG5cbiAgICAvLyBDb252ZXJ0IHRvIEdNVCB0byBlbnN1cmUgY29ycmVjdCBKU09OIHZhbHVlc1xuICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpIC0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjApXG4gICAgcmV0dXJuIGRhdGVcbiAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IGZvcm1hdCBhdHRyaWJ1dGVzIHdoZW4gcmV0cmlldmVkIHdpdGggYGdldEZvcm1hdHRlZGBcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZm9ybWF0dGVycyA9IHtcbiAgZGF0ZTogZm9ybWF0RGF0ZVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYW5kIHNldHMgdGhlIGdpdmVuIGF0dHJpYnV0ZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleSAtIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHZhciB0cmFuc2Zvcm1lciA9IHRoaXMudHJhbnNmb3JtZXJzW2tleV0gfHwgaWRGdW5jdGlvblxuICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHRyYW5zZm9ybWVyKHZhbHVlKVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHRoZSBzdG9yZWQgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc1trZXldXG59XG5cbi8qKlxuICogR2V0IGEgdmFsdWUgZm9ybWF0dGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIGZvcm1hdHRlclxuICogQHBhcmFtIGtleSAtIFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJldHVyblxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBhdHRyaWJ1dGVcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZ2V0Rm9ybWF0dGVkID0gZnVuY3Rpb24gKGtleSkge1xuICB2YXIgZm9ybWF0dGVyID0gdGhpcy5mb3JtYXR0ZXJzW2tleV0gfHwgaWRGdW5jdGlvblxuICByZXR1cm4gZm9ybWF0dGVyKHRoaXMuZ2V0KGtleSkpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4ga2V5cyBvciBhbGwgZm9ybWF0dGVkXG4gKiBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBrZXlzXG4gKiBAcmV0dXJucyB7QXJyYXl9IC0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIGF0dHJpYnV0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gIGtleXMgPSBrZXlzIHx8IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcbiAgcmV0dXJuIGtleXMubWFwKHRoaXMuZ2V0Rm9ybWF0dGVkLmJpbmQodGhpcykpXG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgZm9ybWF0dGVkIHZhbHVlcyBvZiB0aGUgZ2l2ZW4ga2V5cyBvciBhbGwgZm9ybWF0dGVkXG4gKiBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtBcnJheX0ga2V5cyAtIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBrZXlzXG4gKiBAcmV0dXJucyB7QXJyYXl9IC0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIGF0dHJpYnV0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKGtleXMpIHtcbiAga2V5cyA9IGtleXMgfHwgT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuICB2YXIgb2JqZWN0ID0ge31cblxuICBmb3IgKHZhciBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgb2JqZWN0W2tleV0gPSB0aGlzLmdldEZvcm1hdHRlZChrZXkpXG4gIH1cblxuICByZXR1cm4gb2JqZWN0XG59XG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5zZXREYXRlID0gZnVuY3Rpb24gKGF0dHJzKSB7XG4gIGF0dHJzID0gYXR0cnMgfHwge31cbiAgdmFyIGRhdGVTdHJpbmcgPSBhdHRycy5kYXRlU3RyaW5nIHx8IHRoaXMuZ2V0KCdkYXRlU3RyaW5nJylcbiAgdmFyIGRhdGVGb3JtYXQgPSBhdHRycy5kYXRlRm9ybWF0IHx8IHRoaXMuZ2V0KCdkYXRlRm9ybWF0JylcbiAgdmFyIHN1Y2NlZWRpbmdEYXRlID0gYXR0cnMuc3VjY2VlZGluZ0RhdGVcblxuICB2YXIgdHJhbnNhY3Rpb25EYXRlID0gbmV3IFRyYW5zYWN0aW9uRGF0ZShkYXRlU3RyaW5nLCBkYXRlRm9ybWF0LCB7XG4gICAgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlXG4gIH0pXG4gIHRoaXMuc2V0KCd0cmFuc2FjdGlvbkRhdGUnLCB0cmFuc2FjdGlvbkRhdGUpXG4gIHRoaXMuc2V0KCdkYXRlJywgdHJhbnNhY3Rpb25EYXRlLnRvRGF0ZSgpKVxufVxuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuc2V0QW1vdW50ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFpZEluID0gdGhpcy5nZXQoJ3BhaWRJbicpXG4gIHZhciBwYWlkT3V0ID0gdGhpcy5nZXQoJ3BhaWRPdXQnKVxuXG4gIHRoaXMuc2V0KCdhbW91bnQnLCBjYWxjdWxhdGVBbW91bnQocGFpZEluLCBwYWlkT3V0KSlcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlQW1vdW50IChwYWlkSW4sIHBhaWRPdXQpIHtcbiAgcmV0dXJuIHBhaWRJbiA/IHBhaWRJbiA6IC1wYWlkT3V0XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUgKHZhbHVlKSB7XG4gIHZhciB5eXl5ID0gdmFsdWUuZ2V0RnVsbFllYXIoKVxuICB2YXIgbW0gPSBwYWRaZXJvZXModmFsdWUuZ2V0TW9udGgoKSArIDEpXG4gIHZhciBkZCA9IHBhZFplcm9lcyh2YWx1ZS5nZXREYXRlKCkpXG5cbiAgcmV0dXJuIFt5eXl5LCBtbSwgZGRdLmpvaW4oJy0nKVxuXG4gIGZ1bmN0aW9uIHBhZFplcm9lcyAobnVtYmVyKSB7XG4gICAgcmV0dXJuIFN0cmluZygnMDAnICsgbnVtYmVyKS5zbGljZSgtMilcbiAgfVxufVxuXG5mdW5jdGlvbiBpZEZ1bmN0aW9uICh4KSB7IHJldHVybiB4IH1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvblxuIiwidmFyIFRyYW5zYWN0aW9uRGF0ZXMgPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9uLWRhdGVzJylcblxuLyoqXG4gKiBBbiBhcnJheS1saWtlIGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgdHJhbnNhY3Rpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IHRyYW5zYWN0aW9ucyAtIEFuIGFycmF5IG9mIFRyYW5zYWN0aW9uIG9iamVjdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZW1lbnQgLSBUaGUgcGFyZW50IHN0YXRlbWVudFxuICogQHJldHVybnMge0FycmF5fSAtIEFuIGFycmF5IG9mIHRyYW5zYWN0aW9ucyB3aXRoIGNvbnZlbmllbmNlIG1ldGhvZHNcbiAqL1xuXG5mdW5jdGlvbiBUcmFuc2FjdGlvbnMgKHRyYW5zYWN0aW9ucywgc3RhdGVtZW50KSB7XG4gIFRyYW5zYWN0aW9ucy5faW5qZWN0UHJvdG90eXBlTWV0aG9kcyh0cmFuc2FjdGlvbnMpXG5cbiAgLyoqXG4gICAqIFNvbWUgZmluYW5jaWFsIGluc3RpdHV0aW9ucyBvbWl0IHRoZSB5ZWFyIHBhcnQgaW4gdGhlaXIgZGF0ZSBjZWxscy5cbiAgICogVGhpcyB3b3JrYXJvdW5kIGNhbGN1bGF0ZXMgdGhlIHllYXIgZm9yIGVhY2ggdHJhbnNhY3Rpb24gYWZmZWN0ZWQuXG4gICAqL1xuXG4gIGlmICghL1l7Mix9Ly50ZXN0KHN0YXRlbWVudC5kYXRlRm9ybWF0KSkge1xuICAgIGlmICghdHJhbnNhY3Rpb25zLmNocm9ub2xvZ2ljYWwoKSkgdHJhbnNhY3Rpb25zID0gdHJhbnNhY3Rpb25zLnJldmVyc2UoKVxuXG4gICAgdmFyIHN1Y2NlZWRpbmdEYXRlID0gc3RhdGVtZW50LmRhdGVcbiAgICBmb3IgKHZhciBpID0gdHJhbnNhY3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgdHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvbnNbaV1cbiAgICAgIHRyYW5zYWN0aW9uLnNldERhdGUoeyBzdWNjZWVkaW5nRGF0ZTogc3VjY2VlZGluZ0RhdGUgfSlcbiAgICAgIHN1Y2NlZWRpbmdEYXRlID0gdHJhbnNhY3Rpb24uZ2V0KCdkYXRlJylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJhbnNhY3Rpb25zXG59XG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUuY2hyb25vbG9naWNhbCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGRhdGVzLmNhbGwodGhpcykuY2hyb25vbG9naWNhbCgpXG5cbiAgZnVuY3Rpb24gZGF0ZXMgKCkge1xuICAgIHZhciBkYXRlcyA9IHRoaXMubWFwKGZ1bmN0aW9uICh0cmFuc2FjdGlvbikge1xuICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uLmdldCgndHJhbnNhY3Rpb25EYXRlJylcbiAgICB9KVxuICAgIHJldHVybiBuZXcgVHJhbnNhY3Rpb25EYXRlcyhkYXRlcylcbiAgfVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtUcmFuc2FjdGlvbn0gVGhlIGZpcnN0IHRyYW5zYWN0aW9uIGluIHRoZSBjb2xsZWN0aW9uXG4gKi9cblxuVHJhbnNhY3Rpb25zLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXNbMF1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259IFRoZSBsYXN0IHRyYW5zYWN0aW9uIGluIHRoZSBjb2xsZWN0aW9uXG4gKi9cblxuVHJhbnNhY3Rpb25zLnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdXG59XG5cbi8qKlxuICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBmb3JtYXR0ZWQgdHJhbnNhY3Rpb24gYXR0cmlidXRlIGFycmF5c1xuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHsgcmV0dXJuIHRyYW5zYWN0aW9uLnRvQXJyYXkoa2V5cykgfSlcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IG9mIGZvcm1hdHRlZCB0cmFuc2FjdGlvbiBvYmplY3RzXG4gKi9cblxuVHJhbnNhY3Rpb25zLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoa2V5cykge1xuICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHRyYW5zYWN0aW9uKSB7IHJldHVybiB0cmFuc2FjdGlvbi50b0pTT04oa2V5cykgfSlcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBwcm90b3R5cGUgbWV0aG9kcyB0byB0cmFuc2FjdGlvbnMgYXJyYXkgdG8gYXBwZWFyIGxpa2UgaW5oZXJpdGFuY2VcbiAqIEBwcml2YXRlXG4gKi9cblxuVHJhbnNhY3Rpb25zLl9pbmplY3RQcm90b3R5cGVNZXRob2RzID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLnByb3RvdHlwZSkge1xuICAgIGlmICh0aGlzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICBhcnJheVttZXRob2RdID0gdGhpcy5wcm90b3R5cGVbbWV0aG9kXVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zYWN0aW9uc1xuIl19
