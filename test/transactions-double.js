function TransactionsDouble (transactions) {
  var array = transactions || []

  array.chronological = noop
  array.first = noop
  array.last = noop
  array.toArray = noop
  array.toJSON = noop

  return array
}

function noop () {}

module.exports = TransactionsDouble
