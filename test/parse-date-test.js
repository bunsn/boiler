var assert = require('assert')
var parseDate = require('../lib/parse-date')
var actual
var expected

describe('parseDate', function () {
  beforeEach(function () {
    expected = { year: 2015, month: 3, date: 1 }
  })

  it('parses a date with UK-style formatting', function () {
    actual = parseDate('01/04/2015', 'DD/MM/YYYY')
    assert.deepEqual(actual, expected)
  })

  it('parses a date with US-style formatting', function () {
    actual = parseDate('04/01/2015', 'MM/DD/YYYY')
    assert.deepEqual(actual, expected)
  })

  it('parses a date with month names', function () {
    actual = parseDate('1 Apr 2015', 'D MMM YYYY')
    assert.deepEqual(actual, expected)
  })

  it('parses a date with full month names', function () {
    actual = parseDate('1 April 2015', 'D MMMM YYYY')
    assert.deepEqual(actual, expected)
  })

  it('parses an ISO 8601 formatted date', function () {
    actual = parseDate('2015-04-01', 'YYYY-MM-DD')
    assert.deepEqual(actual, expected)
  })

  it('parses a date with a 2-digit year', function () {
    actual = parseDate('15-04-01', 'YY-MM-DD')
    assert.deepEqual(actual, expected)
  })

  it('parses a date in ALL CAPS', function () {
    actual = parseDate('1 APR 2015', 'D MMM YYYY')
    assert.deepEqual(actual, expected)
  })

  it('parses a date with no non-date-part characters', function () {
    actual = parseDate('1Apr2015', 'DMMMYYYY')
    assert.deepEqual(actual, expected)
  })

  it('throws an exception when an invalid date format is given', function () {
    assert.throws(function () {
      actual = parseDate('1 April 2015', 'HELLO WORLD')
    })
  })
})
