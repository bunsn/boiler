var assert = require('assert')
var makeNumber = require('../lib/number/make-number')
var makeAbsoluteNumber = require('../lib/number/make-absolute-number')

describe('makeNumber', function () {
  it('returns the numerical value when symbols are present', function () {
    assert.equal(makeNumber('-£1,219.50'), -1219.5)
  })

  it('returns null for a hyphen', function () {
    assert.equal(makeNumber('-'), null)
  })

  it('returns null for a full stop', function () {
    assert.equal(makeNumber('.'), null)
  })
})

describe('makeAbsoluteNumber', function () {
  it('returns the absolute value when symbols are present', function () {
    assert.equal(makeAbsoluteNumber('-£1,219.50'), 1219.5)
  })

  it('returns null for a hyphen', function () {
    assert.equal(makeAbsoluteNumber('-'), null)
  })
})
