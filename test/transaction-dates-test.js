var assert = require('assert')
var TransactionDates = require('../transaction-dates')
var dates

describe('TransactionDates', function () {
  describe('#chronological', function () {
    it('returns true when there are fewer than 2 dates', function () {
      dates = new TransactionDates([date(2015, 3, 1)])
      assert(dates.chronological())

      dates = new TransactionDates([])
      assert(dates.chronological())
    })

    it('returns true for chronologically listed dates', function () {
      dates = new TransactionDates([date(2015, 3, 1), date(2015, 3, 2)])
      assert(dates.chronological())
    })

    it('returns true for chronologically listed dates with dupes', function () {
      dates = new TransactionDates([
        date(2015, 3, 1),
        date(2015, 3, 1),
        date(2015, 3, 2)
      ])

      assert(dates.chronological())
    })

    it('returns false for reverse-chronologically listed dates', function () {
      dates = new TransactionDates([
        date(2015, 3, 2),
        date(2015, 3, 1),
        date(2015, 3, 1)
      ])

      assert(!dates.chronological())
    })
  })

  describe('#uniq', function () {
    it('removes duplicate dates', function () {
      dates = new TransactionDates([
        date(2015, 3, 1),
        date(2015, 3, 1),
        date(2015, 3, 2)
      ])

      assert.deepEqual(dates.uniq(), [date(2015, 3, 1), date(2015, 3, 2)])
    })
  })

  describe('#compare', function () {
    beforeEach(function () {
      dates = new TransactionDates([])
    })

    it('returns 0 when the dates are the same', function () {
      assert.equal(dates.compare(date(2015, 3, 1), date(2015, 3, 1)), 0)
    })

    it('returns 1 when the first date is older by a day', function () {
      assert.equal(dates.compare(date(2015, 3, 1), date(2015, 3, 2)), 1)
    })

    it('returns 1 when the first date is older by a month', function () {
      assert.equal(dates.compare(date(2015, 2, 1), date(2015, 3, 1)), 1)
    })

    it('returns 1 when the first date is older by a year', function () {
      assert.equal(dates.compare(date(2014, 3, 1), date(2015, 3, 1)), 1)
    })

    it('returns -1 when the first date is younger by a day', function () {
      assert.equal(dates.compare(date(2015, 3, 2), date(2015, 3, 1)), -1)
    })

    it('returns -1 when the first date is younger by a month', function () {
      assert.equal(dates.compare(date(2015, 4, 1), date(2015, 3, 1)), -1)
    })

    it('returns -1 when the first date is younger by a year', function () {
      assert.equal(dates.compare(date(2016, 3, 1), date(2015, 3, 1)), -1)
    })

    context('without years', function () {
      it('returns 1 when first date is Dec and the second is Jan', function () {
        assert.equal(dates.compare(date(void 0, 11, 31), date(void 0, 0, 1)), 1)
      })
    })
  })
})

// Convenient method for generating date object
function date (year, month, date) {
  return { year: year, month: month, date: date }
}
