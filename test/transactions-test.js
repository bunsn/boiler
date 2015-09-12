var assert = require('assert')
var sinon = require('sinon')
var stub = sinon.stub
var TransactionDouble = require('./transaction-double')
var Transactions = require('../transactions')

var statement = { dateFormat: 'YYYY-MM-DD' }
var transaction1
var transaction2
var transactions

describe('Transactions', function () {
  beforeEach(function () {
    stub(TransactionDouble.prototype, 'toArray').returns([])
    stub(TransactionDouble.prototype, 'toJSON').returns({})
    transaction1 = new TransactionDouble()
    transaction2 = new TransactionDouble()
    transactions = new Transactions([transaction1, transaction2], statement)
  })

  afterEach(function () {
    TransactionDouble.prototype.toArray.restore()
    TransactionDouble.prototype.toJSON.restore()
  })

  describe('#first', function () {
    it('returns the first transaction', function () {
      assert.equal(transactions.first(), transaction1)
    })
  })

  describe('#last', function () {
    it('returns the last transaction', function () {
      assert.equal(transactions.last(), transaction2)
    })
  })

  describe('#toArray', function () {
    it('maps its transaction’s toArray return values', function () {
      assert.deepEqual(transactions.toArray(), [[], []])
    })

    it('passes through the attribute keys', function () {
      var keys = ['date']
      transactions.toArray(keys)
      assert(TransactionDouble.prototype.toArray.calledWith(keys))
    })
  })

  describe('#toJSON', function () {
    it('maps its transaction’s toJSON return values', function () {
      assert.deepEqual(transactions.toJSON(), [{}, {}])
    })

    it('passes through the attribute keys', function () {
      var keys = ['date']
      transactions.toJSON(keys)
      assert(TransactionDouble.prototype.toJSON.calledWith(keys))
    })
  })
})
