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
