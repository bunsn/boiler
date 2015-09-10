var makeNumber = require('./make-number')

module.exports = function makeAbsoluteNumber (value) {
  return Math.abs(makeNumber(value))
}
