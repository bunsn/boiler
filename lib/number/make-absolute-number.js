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
