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

module.exports = function makeAbsoluteNumber (value) {
  return Math.abs(makeNumber(value))
}

},{"./make-number":3}],3:[function(require,module,exports){
module.exports = function makeNumber (value) {
  return Number(String(value).replace(/[^\d\.-]/g, ''))
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
 * @param {Array} data - An array of raw values
 * @param {Array} keys - An array of keys
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
  for (var key in attributes) this[key] = result(attributes[key])

  // Convert table to array of transactions
  var transactions = tableToArray(this.table, {
    processRow: function (row) {
      return this.createTransaction(weld(this.columns, row))
    }.bind(this)
  })
  this.transactions = new Transactions(transactions, this)
}

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
    this.calculateYear(options.succeedingDate)
  }
}

/**
 * @returns {Date} A native Date representation of the transaction date
 */

TransactionDate.prototype.toDate = function () {
  if (!Date.parse(this.year, this.month, this.date)) return null

  var date = new Date(this.year, this.month, this.date)

  // Convert to GMT to ensure correct JSON values
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60)

  return date
}

/**
 * Uses the succeeding date to determine the transaction year
 * @returns {Number}
 */

TransactionDate.prototype.calculateYear = function (succeedingDate) {
  var year = succeedingDate.getFullYear()

  // Dec - Jan
  if (succeedingDate.getMonth() === 0 && this.month === 11) year--

  this.year = year
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
 * @constructor
 * @param {Array} data - An array of attribute values
 * @param {Array} columns - An array of attribute keys in the order they appear in `data`
 * @param {Object} options
 */

function Transaction (attributes) {
  this.attributes = {}

  for (var key in attributes) this.set(key, attributes[key])

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
  paidOut: makeAbsoluteNumber
}

/**
 * Functions that format attributes when retrieved with `getFormatted`
 */

Transaction.prototype.formatters = {
  date: formatDate
}

/**
 * Default output columns
 */

Transaction.prototype.output = ['date', 'amount', 'description']

/**
 * Transforms and sets the given attribute
 */

Transaction.prototype.set = function (key, value) {
  var transformer = this.transformers[key] || function (v) { return v }
  this.attributes[key] = transformer(value)
}

/**
 * Returns the stored attribute
 */

Transaction.prototype.get = function (key) {
  return this.attributes[key]
}

/**
 * Returns the formatted attribute
 */

Transaction.prototype.getFormatted = function (key) {
  var value = this.get(key)

  var formatter = this.formatters[key]
  if (typeof formatter === 'function') value = formatter(value)

  return value
}

Transaction.prototype.isValid = function () {
  return this.toArray().every(function (i) { return Boolean(i) })
}

Transaction.prototype.toArray = function () {
  return this.output.map(this.getFormatted.bind(this))
}

Transaction.prototype.toJSON = function () {
  var object = {}

  for (var i = this.output.length - 1; i >= 0; i--) {
    var key = this.output[i]
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

  this.set('amount', amountFromAbsolutes(paidIn, paidOut))
}

function amountFromAbsolutes (paidIn, paidOut) {
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
}

function dates () {
  var dates = this.map(function (transaction) {
    return transaction.get('transactionDate')
  })
  return new TransactionDates(dates)
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

Transactions.prototype.toArray = function () {
  return this.map(function (transaction) { return transaction.toArray() })
}

/**
 * @returns {Array} An array of formatted transaction objects
 */

Transactions.prototype.toJSON = function () {
  return this.map(function (transaction) { return transaction.toJSON() })
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXIuanMiLCJsaWIvbnVtYmVyL21ha2UtbnVtYmVyLmpzIiwibGliL3BhcnNlLWRhdGUuanMiLCJsaWIvcmVzdWx0LmpzIiwibGliL3RhYmxlLXRvLWFycmF5LmpzIiwibGliL3dlbGQuanMiLCJzdGF0ZW1lbnQuanMiLCJ0cmFuc2FjdGlvbi1kYXRlLmpzIiwidHJhbnNhY3Rpb24tZGF0ZXMuanMiLCJ0cmFuc2FjdGlvbi5qcyIsInRyYW5zYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBTdGF0ZW1lbnQgPSByZXF1aXJlKCcuL3N0YXRlbWVudCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0ZXN0U3RhdGVtZW50RGVmaW5pdGlvbjogZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHN0YXRlbWVudCA9IG5ldyBTdGF0ZW1lbnQoZGVmaW5pdGlvbilcbiAgICAgIHZhciB0cmFuc2FjdGlvbnMgPSBzdGF0ZW1lbnQudHJhbnNhY3Rpb25zXG4gICAgICB2YXIgbGFiZWwgPSAndHJhbnNhY3Rpb24nICsgKHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJylcbiAgICAgIHZhciBzZXBhcmF0b3IgPSAnPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSdcblxuICAgICAgY29uc29sZS5sb2coc2VwYXJhdG9yKVxuICAgICAgY29uc29sZS5sb2coJ0JvaWxlcjogJyArIHN0YXRlbWVudC5uYW1lKCkpXG4gICAgICBjb25zb2xlLmxvZyh0cmFuc2FjdGlvbnMubGVuZ3RoICsgJyAnICsgbGFiZWwgKyAnIHBhcnNlZCcpXG5cbiAgICAgIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IHRyYW5zYWN0aW9uOicsIHRyYW5zYWN0aW9ucy5maXJzdCgpLnRvSlNPTigpKVxuICAgICAgICBjb25zb2xlLmxvZygnTGFzdCB0cmFuc2FjdGlvbjonLCB0cmFuc2FjdGlvbnMubGFzdCgpLnRvSlNPTigpKVxuICAgICAgfSBlbHNlIGlmIChzdGF0ZW1lbnQudHJhbnNhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBjb25zb2xlLmxvZygnVHJhbnNhY3Rpb246JywgdHJhbnNhY3Rpb25zLmZpcnN0KCkpXG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhzZXBhcmF0b3IpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb3VsZCBub3QgY3JlYXRlIFN0YXRlbWVudDogJyArIGVycm9yLm1lc3NhZ2UpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgbWFrZU51bWJlciA9IHJlcXVpcmUoJy4vbWFrZS1udW1iZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1ha2VBYnNvbHV0ZU51bWJlciAodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGguYWJzKG1ha2VOdW1iZXIodmFsdWUpKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYWtlTnVtYmVyICh2YWx1ZSkge1xuICByZXR1cm4gTnVtYmVyKFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvW15cXGRcXC4tXS9nLCAnJykpXG59XG4iLCJ2YXIgbW9udGhGb3JtYXRzID0ge1xuICBNTU06IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgTU1NTTogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ11cbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRlIChkYXRlU3RyaW5nLCBmb3JtYXQpIHtcbiAgdmFyIGZvcm1hdFBhcnRzID0gZm9ybWF0LnNwbGl0KC9bXkRNWV0rLylcbiAgdmFyIGRhdGVSZWdleCA9IFJlZ0V4cChmb3JtYXQucmVwbGFjZSgvREQ/LywgJyhcXFxcZFxcXFxkPyknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9NezMsNH0vLCAnKFxcXFx3ezMsfSknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9NTT8vLCAnKFxcXFxkXFxcXGQ/KScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1l7Miw0fS8sICcoXFxcXGR7Miw0fSknKSlcbiAgdmFyIGRhdGVQYXJ0cyA9IGRhdGVTdHJpbmcubWF0Y2goZGF0ZVJlZ2V4KVxuXG4gIGlmIChkYXRlUGFydHMpIHtcbiAgICBkYXRlUGFydHMgPSBkYXRlUGFydHMuc3BsaWNlKDEpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcGFyc2U6IGAnICsgZGF0ZVN0cmluZyArICdgIHdpdGggZm9ybWF0OiBgJyArIGZvcm1hdCArICdgJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBhcnRJbmRleCAocmVnZXgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcm1hdFBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVnZXgudGVzdChmb3JtYXRQYXJ0c1tpXSkpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgdmFyIGRhdGUgPSBkYXRlUGFydHNbZ2V0UGFydEluZGV4KC9ELyldXG5cbiAgLy8gR2V0IG1vbnRoIHBhcnQgYW5kIGNvbnZlcnQgdG8gbnVtYmVyIGNvbXBhdGlibGUgd2l0aCBgRGF0ZWBcblxuICB2YXIgbW9udGggPSAoZnVuY3Rpb24gZ2V0TW9udGggKCkge1xuICAgIHZhciBpID0gZ2V0UGFydEluZGV4KC9NLylcbiAgICB2YXIgbW9udGhGb3JtYXQgPSBmb3JtYXRQYXJ0c1tpXVxuICAgIHZhciBkYXRlUGFydCA9IGRhdGVQYXJ0c1tpXVxuICAgIHZhciBtb250aFxuXG4gICAgaWYgKG1vbnRoRm9ybWF0Lmxlbmd0aCA+IDIpIHtcbiAgICAgIG1vbnRoID0gbW9udGhGb3JtYXRzW21vbnRoRm9ybWF0XS5pbmRleE9mKGRhdGVQYXJ0KVxuICAgIH0gZWxzZSB7XG4gICAgICBtb250aCA9IE51bWJlcihkYXRlUGFydCkgLSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG1vbnRoXG4gIH0pKClcblxuICAvLyBHZXQgeWVhciBwYXJ0IGFuZCBjb252ZXJ0IHRvIG51bWJlciBjb21wYXRpYmxlIHdpdGggYERhdGVgXG5cbiAgdmFyIHllYXIgPSAoZnVuY3Rpb24gZ2V0WWVhciAoKSB7XG4gICAgdmFyIHllYXIgPSBkYXRlUGFydHNbZ2V0UGFydEluZGV4KC9ZLyldXG5cbiAgICBpZiAoeWVhciAmJiAoeWVhci5sZW5ndGggPT09IDIpKSB5ZWFyID0gJzIwJyArIHllYXJcblxuICAgIHJldHVybiB5ZWFyXG4gIH0pKClcblxuICByZXR1cm4geyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRhdGU6IGRhdGUgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlRGF0ZVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJykgPyBvYmplY3QuY2FsbChvYmplY3QpIDogb2JqZWN0XG59XG4iLCIvKipcbiAqIENvbnZlcnRzIGEgdGFibGUgbm9kZSB0byBhIDJEIGFycmF5XG4gKi9cblxuZnVuY3Rpb24gdGFibGVUb0FycmF5ICh0YWJsZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcHJvY2Vzc1JvdyA9IG9wdGlvbnMucHJvY2Vzc1JvdyB8fCBpZFxuICB2YXIgcHJvY2Vzc0NlbGwgPSBvcHRpb25zLnByb2Nlc3NDZWxsIHx8IGlkXG5cbiAgcmV0dXJuIG1hcCh0YWJsZS5xdWVyeVNlbGVjdG9yQWxsKCd0Ym9keSB0cicpLCBmdW5jdGlvbiAodHIsIHJvd0luZGV4LCByb3dzKSB7XG4gICAgdmFyIHJvdyA9IG1hcCh0ci5jZWxscywgZnVuY3Rpb24gKG5vZGUsIGNlbGxJbmRleCwgY2VsbHMpIHtcbiAgICAgIHJldHVybiBwcm9jZXNzQ2VsbChub2RlVGV4dChub2RlKSwgY2VsbEluZGV4LCBjZWxscywgbm9kZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb2Nlc3NSb3cocm93LCByb3dJbmRleCwgcm93cywgdHIpXG4gIH0pXG59XG5cbi8qKlxuICogU3F1YXNoZWQgYW5kIHRyaW1tZWQgbm9kZSB0ZXh0IGNvbnRlbnRcbiAqL1xuXG5mdW5jdGlvbiBub2RlVGV4dCAobm9kZSkge1xuICByZXR1cm4gc3F1YXNoV2hpdGVzcGFjZShub2RlLnRleHRDb250ZW50KVxuXG4gIGZ1bmN0aW9uIHNxdWFzaFdoaXRlc3BhY2UgKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXFxzezIsfS9nLCAnICcpLnRyaW0oKVxuICB9XG59XG5cbi8qKlxuICogbWFwIGZvciBOb2RlTGlzdHNcbiAqL1xuXG5mdW5jdGlvbiBtYXAgKGFycmF5LCBlbnVtZXJhdG9yKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyYXksIGVudW1lcmF0b3IpXG59XG5cbi8qKlxuICogSWRlbnRpdHkgZnVuY3Rpb25cbiAqIEByZXR1cm5zIEl0cyBpbnB1dCFcbiAqL1xuXG5mdW5jdGlvbiBpZCAoeCkgeyByZXR1cm4geCB9XG5cbm1vZHVsZS5leHBvcnRzID0gdGFibGVUb0FycmF5XG4iLCIvKipcbiAqIE1hcHMga2V5cyB0byB2YWx1ZXNcbiAqIEBwYXJhbSB7QXJyYXl9IGRhdGEgLSBBbiBhcnJheSBvZiByYXcgdmFsdWVzXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzIC0gQW4gYXJyYXkgb2Yga2V5c1xuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiB3ZWxkIChrZXlzLCB2YWx1ZXMpIHtcbiAgdmFyIG9iamVjdCA9IHt9XG4gIGZvciAodmFyIGkgPSBrZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBvYmplY3Rba2V5c1tpXV0gPSB2YWx1ZXNbaV1cbiAgcmV0dXJuIG9iamVjdFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdlbGRcbiIsInZhciByZXN1bHQgPSByZXF1aXJlKCcuL2xpYi9yZXN1bHQnKVxudmFyIHRhYmxlVG9BcnJheSA9IHJlcXVpcmUoJy4vbGliL3RhYmxlLXRvLWFycmF5JylcbnZhciB3ZWxkID0gcmVxdWlyZSgnLi9saWIvd2VsZCcpXG52YXIgVHJhbnNhY3Rpb24gPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9uJylcbnZhciBUcmFuc2FjdGlvbnMgPSByZXF1aXJlKCcuL3RyYW5zYWN0aW9ucycpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIFN0YXRlbWVudFxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cmlidXRlcyAtIFVzdWFsbHkgYSBzdGF0ZW1lbnQgZGVmaW5pdGlvblxuICovXG5cbmZ1bmN0aW9uIFN0YXRlbWVudCAoYXR0cmlidXRlcykge1xuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykgdGhpc1trZXldID0gcmVzdWx0KGF0dHJpYnV0ZXNba2V5XSlcblxuICAvLyBDb252ZXJ0IHRhYmxlIHRvIGFycmF5IG9mIHRyYW5zYWN0aW9uc1xuICB2YXIgdHJhbnNhY3Rpb25zID0gdGFibGVUb0FycmF5KHRoaXMudGFibGUsIHtcbiAgICBwcm9jZXNzUm93OiBmdW5jdGlvbiAocm93KSB7XG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVUcmFuc2FjdGlvbih3ZWxkKHRoaXMuY29sdW1ucywgcm93KSlcbiAgICB9LmJpbmQodGhpcylcbiAgfSlcbiAgdGhpcy50cmFuc2FjdGlvbnMgPSBuZXcgVHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9ucywgdGhpcylcbn1cblxuU3RhdGVtZW50LnByb3RvdHlwZS5jcmVhdGVUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG4gIGF0dHJpYnV0ZXMuZGF0ZVN0cmluZyA9IGF0dHJpYnV0ZXMuZGF0ZVxuICBhdHRyaWJ1dGVzLmRhdGVGb3JtYXQgPSB0aGlzLmRhdGVGb3JtYXRcbiAgZGVsZXRlIGF0dHJpYnV0ZXMuZGF0ZVxuICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKGF0dHJpYnV0ZXMpXG59XG5cbi8qKlxuICogQHJldHVybnMge1N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIHN0YXRlbWVudCBiYXNlZCBvbiB0aGUgc3RhdGVtZW50IGRhdGVcbiAqL1xuXG5TdGF0ZW1lbnQucHJvdG90eXBlLm5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsYWJlbCA9IHRoaXMuaW5zdGl0dXRpb24gKyAnIFN0YXRlbWVudCdcblxuICBpZiAodGhpcy50cmFuc2FjdGlvbnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGxhYmVsICsgJyAnICsgdGhpcy50cmFuc2FjdGlvbnMubGFzdCgpLmdldEZvcm1hdHRlZCgnZGF0ZScpXG4gIH1cbiAgcmV0dXJuIGxhYmVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVtZW50XG4iLCJ2YXIgcGFyc2VEYXRlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UtZGF0ZScpXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRyYW5zYWN0aW9uIGRhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBUcmFuc2FjdGlvbkRhdGUgKGRhdGVTdHJpbmcsIGZvcm1hdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgcGFyc2VkID0gcGFyc2VEYXRlKGRhdGVTdHJpbmcsIGZvcm1hdClcblxuICB0aGlzLnllYXIgPSBwYXJzZWQueWVhclxuICB0aGlzLm1vbnRoID0gcGFyc2VkLm1vbnRoXG4gIHRoaXMuZGF0ZSA9IHBhcnNlZC5kYXRlXG5cbiAgaWYgKCF0aGlzLnllYXIgJiYgb3B0aW9ucy5zdWNjZWVkaW5nRGF0ZSkge1xuICAgIHRoaXMuY2FsY3VsYXRlWWVhcihvcHRpb25zLnN1Y2NlZWRpbmdEYXRlKVxuICB9XG59XG5cbi8qKlxuICogQHJldHVybnMge0RhdGV9IEEgbmF0aXZlIERhdGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zYWN0aW9uIGRhdGVcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGUucHJvdG90eXBlLnRvRGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFEYXRlLnBhcnNlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKSkgcmV0dXJuIG51bGxcblxuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXRlKVxuXG4gIC8vIENvbnZlcnQgdG8gR01UIHRvIGVuc3VyZSBjb3JyZWN0IEpTT04gdmFsdWVzXG4gIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpIC0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjApXG5cbiAgcmV0dXJuIGRhdGVcbn1cblxuLyoqXG4gKiBVc2VzIHRoZSBzdWNjZWVkaW5nIGRhdGUgdG8gZGV0ZXJtaW5lIHRoZSB0cmFuc2FjdGlvbiB5ZWFyXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cblRyYW5zYWN0aW9uRGF0ZS5wcm90b3R5cGUuY2FsY3VsYXRlWWVhciA9IGZ1bmN0aW9uIChzdWNjZWVkaW5nRGF0ZSkge1xuICB2YXIgeWVhciA9IHN1Y2NlZWRpbmdEYXRlLmdldEZ1bGxZZWFyKClcblxuICAvLyBEZWMgLSBKYW5cbiAgaWYgKHN1Y2NlZWRpbmdEYXRlLmdldE1vbnRoKCkgPT09IDAgJiYgdGhpcy5tb250aCA9PT0gMTEpIHllYXItLVxuXG4gIHRoaXMueWVhciA9IHllYXJcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2FjdGlvbkRhdGVcbiIsIi8qKlxuICogUmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgdHJhbnNhY3Rpb24gZGF0ZXNcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGRhdGVzIC0gQW4gYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSB7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF0ZTogZGF0ZSB9XG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25EYXRlcyAoZGF0ZXMpIHtcbiAgdGhpcy5kYXRlcyA9IGRhdGVzXG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBkYXRlcyBhcmUgY2hyb25vbG9naWNhbCBvciBub3RcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5cblRyYW5zYWN0aW9uRGF0ZXMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB1bmlxID0gdGhpcy51bmlxKClcbiAgaWYgKHVuaXEubGVuZ3RoIDwgMikgcmV0dXJuIHRydWVcblxuICByZXR1cm4gdGhpcy5jb21wYXJlKHVuaXFbMF0sIHVuaXFbMV0pID49IDBcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB1bmlxdWUgZGF0ZXNcbiAqL1xuXG5UcmFuc2FjdGlvbkRhdGVzLnByb3RvdHlwZS51bmlxID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdW5pcXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkYXRlID0gdGhpcy5kYXRlc1tpXVxuICAgIGlmIChpblVuaXFzKGRhdGUpKSBjb250aW51ZVxuICAgIHVuaXFzLnB1c2goZGF0ZSlcbiAgfVxuXG4gIHJldHVybiB1bmlxc1xuXG4gIC8vIERldGVybWluZXMgd2hldGhlciBhIGRhdGUgYWxyZWFkeSBleGlzdHMgaW4gdGhlIHVuaXFzIGFycmF5XG4gIGZ1bmN0aW9uIGluVW5pcXMgKGQpIHtcbiAgICByZXR1cm4gdW5pcXMuc29tZShmdW5jdGlvbiAodSkge1xuICAgICAgcmV0dXJuIHUueWVhciA9PT0gZC55ZWFyICYmIHUubW9udGggPT09IGQubW9udGggJiYgdS5kYXRlID09PSBkLmRhdGVcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIGRhdGVzIHRvIHRlc3QgY2hyb25vbG9neVxuICogQHJldHVybnMge051bWJlcn0gMDogYSA9PSBiLCAxOiBhID4gYiwgLTE6IGEgPCBiXG4gKi9cblxuVHJhbnNhY3Rpb25EYXRlcy5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIC8vIElmIG5vIHllYXIsIGFuZCBkYXRlcyBnbyBmcm9tIERlYyAtIEphbiwgYXNzdW1lIERlYyBkYXRlIGlzIG9sZGVyXG4gIGlmICgoIWEueWVhciB8fCAhYi55ZWFyKSAmJiBhLm1vbnRoID09PSAxMSAmJiBiLm1vbnRoID09PSAwKSByZXR1cm4gMVxuXG4gIGlmIChhLnllYXIgPT09IGIueWVhcikge1xuICAgIGlmIChhLm1vbnRoID09PSBiLm1vbnRoKSB7XG4gICAgICBpZiAoYS5kYXRlID4gYi5kYXRlKSByZXR1cm4gLTFcbiAgICAgIGlmIChhLmRhdGUgPCBiLmRhdGUpIHJldHVybiAxXG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuICAgIGlmIChhLm1vbnRoID4gYi5tb250aCkgcmV0dXJuIC0xXG4gICAgaWYgKGEubW9udGggPCBiLm1vbnRoKSByZXR1cm4gMVxuICB9XG4gIGlmIChhLnllYXIgPiBiLnllYXIpIHJldHVybiAtMVxuICBpZiAoYS55ZWFyIDwgYi55ZWFyKSByZXR1cm4gMVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zYWN0aW9uRGF0ZXNcbiIsInZhciBtYWtlTnVtYmVyID0gcmVxdWlyZSgnLi9saWIvbnVtYmVyL21ha2UtbnVtYmVyJylcbnZhciBtYWtlQWJzb2x1dGVOdW1iZXIgPSByZXF1aXJlKCcuL2xpYi9udW1iZXIvbWFrZS1hYnNvbHV0ZS1udW1iZXInKVxudmFyIFRyYW5zYWN0aW9uRGF0ZSA9IHJlcXVpcmUoJy4vdHJhbnNhY3Rpb24tZGF0ZScpXG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBkYXRhIC0gQW4gYXJyYXkgb2YgYXR0cmlidXRlIHZhbHVlc1xuICogQHBhcmFtIHtBcnJheX0gY29sdW1ucyAtIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBrZXlzIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhciBpbiBgZGF0YWBcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbiAgdGhpcy5hdHRyaWJ1dGVzID0ge31cblxuICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykgdGhpcy5zZXQoa2V5LCBhdHRyaWJ1dGVzW2tleV0pXG5cbiAgaWYgKCF0aGlzLmdldCgnZGF0ZScpKSB0aGlzLnNldERhdGUoKVxuICBpZiAoIXRoaXMuZ2V0KCdhbW91bnQnKSkgdGhpcy5zZXRBbW91bnQoKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IHRyYW5zZm9ybSBhdHRyaWJ1dGVzIGFzIHRoZXkgYXJlIHNldFxuICovXG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS50cmFuc2Zvcm1lcnMgPSB7XG4gIGFtb3VudDogbWFrZU51bWJlcixcbiAgYmFsYW5jZTogbWFrZU51bWJlcixcbiAgcGFpZEluOiBtYWtlQWJzb2x1dGVOdW1iZXIsXG4gIHBhaWRPdXQ6IG1ha2VBYnNvbHV0ZU51bWJlclxufVxuXG4vKipcbiAqIEZ1bmN0aW9ucyB0aGF0IGZvcm1hdCBhdHRyaWJ1dGVzIHdoZW4gcmV0cmlldmVkIHdpdGggYGdldEZvcm1hdHRlZGBcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZm9ybWF0dGVycyA9IHtcbiAgZGF0ZTogZm9ybWF0RGF0ZVxufVxuXG4vKipcbiAqIERlZmF1bHQgb3V0cHV0IGNvbHVtbnNcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUub3V0cHV0ID0gWydkYXRlJywgJ2Ftb3VudCcsICdkZXNjcmlwdGlvbiddXG5cbi8qKlxuICogVHJhbnNmb3JtcyBhbmQgc2V0cyB0aGUgZ2l2ZW4gYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHZhciB0cmFuc2Zvcm1lciA9IHRoaXMudHJhbnNmb3JtZXJzW2tleV0gfHwgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYgfVxuICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHRyYW5zZm9ybWVyKHZhbHVlKVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN0b3JlZCBhdHRyaWJ1dGVcbiAqL1xuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzW2tleV1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBmb3JtYXR0ZWQgYXR0cmlidXRlXG4gKi9cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLmdldEZvcm1hdHRlZCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdmFyIHZhbHVlID0gdGhpcy5nZXQoa2V5KVxuXG4gIHZhciBmb3JtYXR0ZXIgPSB0aGlzLmZvcm1hdHRlcnNba2V5XVxuICBpZiAodHlwZW9mIGZvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJykgdmFsdWUgPSBmb3JtYXR0ZXIodmFsdWUpXG5cbiAgcmV0dXJuIHZhbHVlXG59XG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50b0FycmF5KCkuZXZlcnkoZnVuY3Rpb24gKGkpIHsgcmV0dXJuIEJvb2xlYW4oaSkgfSlcbn1cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm91dHB1dC5tYXAodGhpcy5nZXRGb3JtYXR0ZWQuYmluZCh0aGlzKSlcbn1cblxuVHJhbnNhY3Rpb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9iamVjdCA9IHt9XG5cbiAgZm9yICh2YXIgaSA9IHRoaXMub3V0cHV0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGtleSA9IHRoaXMub3V0cHV0W2ldXG4gICAgb2JqZWN0W2tleV0gPSB0aGlzLmdldEZvcm1hdHRlZChrZXkpXG4gIH1cblxuICByZXR1cm4gb2JqZWN0XG59XG5cblRyYW5zYWN0aW9uLnByb3RvdHlwZS5zZXREYXRlID0gZnVuY3Rpb24gKGF0dHJzKSB7XG4gIGF0dHJzID0gYXR0cnMgfHwge31cbiAgdmFyIGRhdGVTdHJpbmcgPSBhdHRycy5kYXRlU3RyaW5nIHx8IHRoaXMuZ2V0KCdkYXRlU3RyaW5nJylcbiAgdmFyIGRhdGVGb3JtYXQgPSBhdHRycy5kYXRlRm9ybWF0IHx8IHRoaXMuZ2V0KCdkYXRlRm9ybWF0JylcbiAgdmFyIHN1Y2NlZWRpbmdEYXRlID0gYXR0cnMuc3VjY2VlZGluZ0RhdGVcblxuICB2YXIgdHJhbnNhY3Rpb25EYXRlID0gbmV3IFRyYW5zYWN0aW9uRGF0ZShkYXRlU3RyaW5nLCBkYXRlRm9ybWF0LCB7XG4gICAgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlXG4gIH0pXG4gIHRoaXMuc2V0KCd0cmFuc2FjdGlvbkRhdGUnLCB0cmFuc2FjdGlvbkRhdGUpXG4gIHRoaXMuc2V0KCdkYXRlJywgdHJhbnNhY3Rpb25EYXRlLnRvRGF0ZSgpKVxufVxuXG5UcmFuc2FjdGlvbi5wcm90b3R5cGUuc2V0QW1vdW50ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFpZEluID0gdGhpcy5nZXQoJ3BhaWRJbicpXG4gIHZhciBwYWlkT3V0ID0gdGhpcy5nZXQoJ3BhaWRPdXQnKVxuXG4gIHRoaXMuc2V0KCdhbW91bnQnLCBhbW91bnRGcm9tQWJzb2x1dGVzKHBhaWRJbiwgcGFpZE91dCkpXG59XG5cbmZ1bmN0aW9uIGFtb3VudEZyb21BYnNvbHV0ZXMgKHBhaWRJbiwgcGFpZE91dCkge1xuICByZXR1cm4gcGFpZEluID8gcGFpZEluIDogLXBhaWRPdXRcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZSAodmFsdWUpIHtcbiAgdmFyIHl5eXkgPSB2YWx1ZS5nZXRGdWxsWWVhcigpXG4gIHZhciBtbSA9IHBhZFplcm9lcyh2YWx1ZS5nZXRNb250aCgpICsgMSlcbiAgdmFyIGRkID0gcGFkWmVyb2VzKHZhbHVlLmdldERhdGUoKSlcblxuICByZXR1cm4gW3l5eXksIG1tLCBkZF0uam9pbignLScpXG5cbiAgZnVuY3Rpb24gcGFkWmVyb2VzIChudW1iZXIpIHtcbiAgICByZXR1cm4gU3RyaW5nKCcwMCcgKyBudW1iZXIpLnNsaWNlKC0yKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNhY3Rpb25cbiIsInZhciBUcmFuc2FjdGlvbkRhdGVzID0gcmVxdWlyZSgnLi90cmFuc2FjdGlvbi1kYXRlcycpXG5cbi8qKlxuICogQW4gYXJyYXktbGlrZSBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBjb2xsZWN0aW9uIG9mIHRyYW5zYWN0aW9uc1xuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSB0cmFuc2FjdGlvbnMgLSBBbiBhcnJheSBvZiBUcmFuc2FjdGlvbiBvYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhdGVtZW50IC0gVGhlIHBhcmVudCBzdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtBcnJheX0gLSBBbiBhcnJheSBvZiB0cmFuc2FjdGlvbnMgd2l0aCBjb252ZW5pZW5jZSBtZXRob2RzXG4gKi9cblxuZnVuY3Rpb24gVHJhbnNhY3Rpb25zICh0cmFuc2FjdGlvbnMsIHN0YXRlbWVudCkge1xuICBUcmFuc2FjdGlvbnMuX2luamVjdFByb3RvdHlwZU1ldGhvZHModHJhbnNhY3Rpb25zKVxuXG4gIC8qKlxuICAgKiBTb21lIGZpbmFuY2lhbCBpbnN0aXR1dGlvbnMgb21pdCB0aGUgeWVhciBwYXJ0IGluIHRoZWlyIGRhdGUgY2VsbHMuXG4gICAqIFRoaXMgd29ya2Fyb3VuZCBjYWxjdWxhdGVzIHRoZSB5ZWFyIGZvciBlYWNoIHRyYW5zYWN0aW9uIGFmZmVjdGVkLlxuICAgKi9cblxuICBpZiAoIS9ZezIsfS8udGVzdChzdGF0ZW1lbnQuZGF0ZUZvcm1hdCkpIHtcbiAgICBpZiAoIXRyYW5zYWN0aW9ucy5jaHJvbm9sb2dpY2FsKCkpIHRyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucy5yZXZlcnNlKClcblxuICAgIHZhciBzdWNjZWVkaW5nRGF0ZSA9IHN0YXRlbWVudC5kYXRlXG4gICAgZm9yICh2YXIgaSA9IHRyYW5zYWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb25zW2ldXG4gICAgICB0cmFuc2FjdGlvbi5zZXREYXRlKHsgc3VjY2VlZGluZ0RhdGU6IHN1Y2NlZWRpbmdEYXRlIH0pXG4gICAgICBzdWNjZWVkaW5nRGF0ZSA9IHRyYW5zYWN0aW9uLmdldCgnZGF0ZScpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRyYW5zYWN0aW9uc1xufVxuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLmNocm9ub2xvZ2ljYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBkYXRlcy5jYWxsKHRoaXMpLmNocm9ub2xvZ2ljYWwoKVxufVxuXG5mdW5jdGlvbiBkYXRlcyAoKSB7XG4gIHZhciBkYXRlcyA9IHRoaXMubWFwKGZ1bmN0aW9uICh0cmFuc2FjdGlvbikge1xuICAgIHJldHVybiB0cmFuc2FjdGlvbi5nZXQoJ3RyYW5zYWN0aW9uRGF0ZScpXG4gIH0pXG4gIHJldHVybiBuZXcgVHJhbnNhY3Rpb25EYXRlcyhkYXRlcylcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7VHJhbnNhY3Rpb259IFRoZSBmaXJzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUuZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzWzBdXG59XG5cbi8qKlxuICogQHJldHVybnMge1RyYW5zYWN0aW9ufSBUaGUgbGFzdCB0cmFuc2FjdGlvbiBpbiB0aGUgY29sbGVjdGlvblxuICovXG5cblRyYW5zYWN0aW9ucy5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIHRyYW5zYWN0aW9uIGF0dHJpYnV0ZSBhcnJheXNcbiAqL1xuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAodHJhbnNhY3Rpb24pIHsgcmV0dXJuIHRyYW5zYWN0aW9uLnRvQXJyYXkoKSB9KVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2YgZm9ybWF0dGVkIHRyYW5zYWN0aW9uIG9iamVjdHNcbiAqL1xuXG5UcmFuc2FjdGlvbnMucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uICh0cmFuc2FjdGlvbikgeyByZXR1cm4gdHJhbnNhY3Rpb24udG9KU09OKCkgfSlcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBwcm90b3R5cGUgbWV0aG9kcyB0byB0cmFuc2FjdGlvbnMgYXJyYXkgdG8gYXBwZWFyIGxpa2UgaW5oZXJpdGFuY2VcbiAqIEBwcml2YXRlXG4gKi9cblxuVHJhbnNhY3Rpb25zLl9pbmplY3RQcm90b3R5cGVNZXRob2RzID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gIGZvciAodmFyIG1ldGhvZCBpbiB0aGlzLnByb3RvdHlwZSkge1xuICAgIGlmICh0aGlzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICBhcnJheVttZXRob2RdID0gdGhpcy5wcm90b3R5cGVbbWV0aG9kXVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zYWN0aW9uc1xuIl19
