var assert = require('assert')
var Statement = require('../statement')
var Transaction = require('../transaction')

var definition
var statement

describe('Statement', function () {
  describe('#createTransaction', function () {
    beforeEach(function () {
      definition = {
        table: document.createElement('table'),
        dateFormat: 'D MMM YYYY'
      }
      statement = new Statement(definition)
    })

    it('returns a Transaction', function () {
      var transaction = statement.createTransaction({
        date: '1 Apr 2015',
        amount: 10
      })
      assert(transaction instanceof Transaction)
    })

    it('calls Transaction with dateString and dateFormat')
  })
})
