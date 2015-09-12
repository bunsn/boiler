var assert = require('assert')
var Transactions = require('../transactions')
var TransactionsDouble = require('./transactions-double')

var testClasses = [Transactions, TransactionsDouble]
var testInstance

for (var i = 0; i < testClasses.length; i++) {
  var TestClass = testClasses[i]

  describe(TestClass.toString(), function () {
    beforeEach(function () {
      testInstance = new TestClass()
    })

    var methods = ['chronological', 'first', 'last', 'toArray', 'toJSON']

    for (var i = 0; i < methods.length; i++) {
      var method = methods[i]
      it('responds to ' + method, function () {
        assert(testInstance[method])
      })
    }

    it('is an instance of an array', function () {
      assert(testInstance instanceof Array)
    })
  })
}
