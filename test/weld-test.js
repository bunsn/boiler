var assert = require('assert')
var weld = require('../lib/weld')

describe('weld', function () {
  it('maps keys to values', function () {
    var keys = ['Hello', 'Foo']
    var values = ['World', 'Bar']

    assert.deepEqual(weld(keys, values), { Hello: 'World', Foo: 'Bar' })
  })
})
