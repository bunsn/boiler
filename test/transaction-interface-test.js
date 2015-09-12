var assert = require('assert')
var Transaction = require('../transaction')
var TransactionDouble = require('./transaction-double')

var testClasses = [Transaction, TransactionDouble]

for (var i = 0; i < testClasses.length; i++) {
  var TestClass = testClasses[i]

  describe(TestClass.toString(), function () {
    var methods = ['set', 'get', 'getFormatted', 'toArray', 'toJSON']

    for (var i = 0; i < methods.length; i++) {
      var method = methods[i]
      it('responds to ' + method, function () {
        assert(TestClass.prototype[method])
      })
    }
  })
}
