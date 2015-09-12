function TransactionDouble () {}

TransactionDouble.prototype.set = noop
TransactionDouble.prototype.get = noop
TransactionDouble.prototype.getFormatted = noop
TransactionDouble.prototype.toArray = noop
TransactionDouble.prototype.toJSON = noop

function noop () {}

module.exports = TransactionDouble
