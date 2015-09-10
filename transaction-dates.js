/**
 * Represents a collection of transaction dates
 * @constructor
 * @private
 * @param {Array} dates - An array of objects in the form { year: year, month: month, date: date }
 */

function TransactionDates (dates) {
  this.dates = dates
}

/**
 * Determines whether the dates are chronological or not
 * @returns {Boolean}
 */

TransactionDates.prototype.chronological = function () {
  var uniq = this.uniq()
  if (uniq.length < 2) return true

  return this.compare(uniq[0], uniq[1]) >= 0
}

/**
 * @returns {Array} The unique dates
 */

TransactionDates.prototype.uniq = function () {
  var uniqs = []

  for (var i = 0; i < this.dates.length; i++) {
    var date = this.dates[i]
    if (inUniqs(date)) continue
    uniqs.push(date)
  }

  return uniqs

  // Determines whether a date already exists in the uniqs array
  function inUniqs (d) {
    return uniqs.some(function (u) {
      return u.year === d.year && u.month === d.month && u.date === d.date
    })
  }
}

/**
 * Compares two dates to test chronology
 * @returns {Number} 0: a == b, 1: a > b, -1: a < b
 */

TransactionDates.prototype.compare = function (a, b) {
  // If no year, and dates go from Dec - Jan, assume Dec date is older
  if ((!a.year || !b.year) && a.month === 11 && b.month === 0) return 1

  if (a.year === b.year) {
    if (a.month === b.month) {
      if (a.date > b.date) return -1
      if (a.date < b.date) return 1
      return 0
    }

    if (a.month > b.month) return -1
    if (a.month < b.month) return 1
  }
  if (a.year > b.year) return -1
  if (a.year < b.year) return 1
}

module.exports = TransactionDates
