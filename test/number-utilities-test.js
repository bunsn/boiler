var assert = require('assert')
var makeNumber = require('../lib/number/make-number')
var makeAbsoluteNumber = require('../lib/number/make-absolute-number')

describe('makeNumber', function () {
  it('returns the numerical value when symbols are present', function () {
    assert.equal(makeNumber('-£1,219.50'), -1219.5)
  })
})

describe('makeAbsoluteNumber', function () {
  it('returns the absolute value when symbols are present', function () {
    assert.equal(makeAbsoluteNumber('-£1,219.50'), 1219.5)
  })
})
