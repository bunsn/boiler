var assert = require('assert')
var sinon = require('sinon')
var stub = sinon.stub

var TransactionDate = require('../transaction-date')
var transactionDate

describe('TransactionDate', function () {
  beforeEach(function () {
    transactionDate = new TransactionDate('1 Apr 2015', 'D MMM YYYY')
  })

  describe('#constructor', function () {
    it('parses the date', function () {
      assert.equal(transactionDate.year, 2015)
      assert.equal(transactionDate.month, 3)
      assert.equal(transactionDate.date, 1)
    })

    context('when no year present', function () {
      var calculateYearStub
      var year = 2015
      var succeedingDate = new Date(2015, 3, 2)

      beforeEach(function () {
        calculateYearStub = stub(TransactionDate.prototype, 'calculateYear').returns(year)

        transactionDate = new TransactionDate('1 Apr', 'D MMM', {
          succeedingDate: succeedingDate
        })
      })

      afterEach(function () {
        calculateYearStub.restore()
      })

      it('calculates the year when no year present', function () {
        assert(calculateYearStub.calledWith(succeedingDate))
      })

      it('sets the year', function () {
        assert.equal(transactionDate.year, year)
      })
    })
  })

  describe('#toDate', function () {
    it('returns null if an invalid date', function () {
      transactionDate.year = void 0
      assert.equal(transactionDate.toDate(), null)
    })

    it('returns a native date object', function () {
      var expected = new Date(
        transactionDate.year,
        transactionDate.month,
        transactionDate.date
      )
      assert.deepEqual(transactionDate.toDate(), expected)
    })
  })

  describe('#calculateYear', function () {
    beforeEach(function () {
      transactionDate = new TransactionDate('2 Jul', 'D MMM')
    })

    context('when succeeding date is not Jan and the date is not Dec', function () {
      it('returns the succeeding date’s year', function () {
        assert.equal(transactionDate.calculateYear(new Date(2015, 8, 2)), 2015)
      })
    })

    context('when succeeding date is Jan but date’s month is not Dec', function () {
      it('returns the succeeding date’s year', function () {
        assert.equal(transactionDate.calculateYear(new Date(2016, 0, 2)), 2016)
      })
    })

    context('when succeeding date is not Jan but date’s month is Dec', function () {
      it('returns the succeeding date’s year', function () {
        transactionDate.month = 11
        assert.equal(transactionDate.calculateYear(new Date(2015, 8, 3)), 2015)
      })
    })

    context('when succeeding date is Jan and date’s month is Dec', function () {
      it('subtracts 1 from the succeeding date', function () {
        transactionDate.month = 11
        assert.equal(transactionDate.calculateYear(new Date(2015, 0, 2)), 2014)
      })
    })
  })
})
