var proxyquire = require('proxyquireify')(require)
var assert = require('assert')
var sinon = require('sinon')
var spy = sinon.spy
var stub = sinon.stub

var TransactionDouble = require('./transaction-double')
var TransactionsDouble = require('./transactions-double')

var TransactionStub = spy()
var TransactionsStub = spy()
var Statement = proxyquire('../statement', {
  './transaction': TransactionStub,
  './transactions': TransactionsStub
})
var table = document.createElement('table')
table.innerHTML = [
  '<tbody>',
  '  <tr>',
  '    <td>1 Apr 2015</td>',
  '  </tr>',
  '<tbody>'
].join('\n')

var definition
var statement
var attributes

describe('Statement', function () {
  beforeEach(function () {
    definition = {
      institution: 'My Bank',
      rows: table.querySelectorAll('tbody tr'),
      columns: ['date'],
      dateFormat: 'D MMM YYYY'
    }

    attributes = {
      date: '1 Apr 2015',
      amount: '10'
    }
  })

  afterEach(function () {
    TransactionStub.reset()
  })

  describe('#constructor', function () {
    it('sets up the transactions property', function () {
      statement = new Statement(definition)
      assert(statement.transactions instanceof TransactionsStub)
    })

    it('calls createTransaction for each row', function () {
      var createTransactionStub = stub(Statement.prototype, 'createTransaction')
      statement = new Statement(definition)

      assert(createTransactionStub.called)

      Statement.prototype.createTransaction.restore()
    })
  })

  describe('#createTransaction', function () {
    beforeEach(function () {
      statement = new Statement(definition)
    })

    it('returns an instance of Transaction', function () {
      assert(statement.createTransaction(attributes) instanceof TransactionStub)
    })

    it('calls Transaction with dateString and dateFormat', function () {
      // Ensure TransactionStub is reset after statement has been instantiated
      TransactionStub.reset()

      var expected = {
        dateString: attributes.date,
        dateFormat: definition.dateFormat,
        amount: attributes.amount
      }

      statement.createTransaction(attributes)

      assert(TransactionStub.calledOnce)
      assert(TransactionStub.calledWithNew)
      assert.deepEqual(TransactionStub.firstCall.args[0], expected)
    })
  })

  describe('#name', function () {
    it('returns the institution name', function () {
      statement = new Statement(definition)
      stub(statement, 'transactions', [])
      assert.equal(statement.name(), definition.institution + ' Statement')
    })

    it('returns the institution name and last transaction date', function () {
      var formattedDate = '2015-04-01'
      var transaction = new TransactionDouble()
      stub(transaction, 'getFormatted').withArgs('date').returns(formattedDate)
      var transactions = new TransactionsDouble([transaction], statement)
      stub(transactions, 'last').returns(transaction)

      statement = new Statement(definition)
      statement.transactions = transactions

      var expected = definition.institution + ' Statement ' + formattedDate

      assert.equal(statement.name(), expected)
    })
  })
})
