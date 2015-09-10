var assert = require('assert')
var result = require('../lib/result')

describe('result', function () {
  it('returns the result of a function call', function () {
    var object = function () { return 'foo' }
    assert.equal(result(object), 'foo')
  })

  it('returns a non-function value', function () {
    assert.equal(result(5), 5)
  })
})
