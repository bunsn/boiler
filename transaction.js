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
