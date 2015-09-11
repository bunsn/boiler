var assert = require('assert')
var Transaction = require('../transaction')

var attributes = {
  date: new Date(2015, 3, 1),
  type: 'INT',
  description: '31MAR GRS 12345678',
  paidIn: '205.22',
  paidOut: '-',
  balance: '5605.74'
}

var transaction
var actual
var formattedValue

describe('Transaction', function () {
  beforeEach(function () {
    transaction = new Transaction(attributes)
  })

  describe('#constructor', function () {
    it('maps the data to named attributes', function () {
      assert.equal(transaction.get('description'), attributes.description)
    })

    it('sets the amount attribute from absolute values', function () {
      assert.equal(transaction.attributes.amount, 205.22)
    })
  })

  describe('#set', function () {
    it('sets string values on the attributes object', function () {
      transaction.set('description', 'foo')
      assert.equal(transaction.attributes.description, 'foo')
    })
  })

  describe('#get', function () {
    it('gets values from the attributes object', function () {
      transaction.set('description', 'foo')

      assert.equal(transaction.get('description'),
        transaction.attributes.description)
    })
  })

  describe('#getFormatted', function () {
    it('formats numerical values to two decimal places', function () {
      var date = new Date(2014, 3, 1)
      transaction.set('date', date)
      assert.strictEqual(transaction.getFormatted('date'), '2014-04-01')
    })
  })

  describe('#toArray', function () {
    it('returns an array of all the attributes (formatted)', function () {
      actual = transaction.toArray()

      for (var key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          formattedValue = transaction.getFormatted(key)
          assert(actual.indexOf(formattedValue) >= 0)
        }
      }
    })

    it('returns just the requested attributes', function () {
      formattedValue = transaction.getFormatted('date')
      assert.deepEqual(transaction.toArray(['date']), [formattedValue])
    })
  })

  describe('#toJSON', function () {
    it('returns an object of all the attributes (formatted)', function () {
      actual = transaction.toJSON()

      for (var key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          assert.equal(actual[key], transaction.getFormatted(key))
        }
      }
    })

    it('returns just the requested attributes', function () {
      formattedValue = transaction.getFormatted('date')
      assert.deepEqual(transaction.toJSON(['date']), { date: formattedValue })
    })
  })
})
