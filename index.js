var Statement = require('./statement')

module.exports = {
  testStatementDefinition: function (definition) {
    try {
      var statement = new Statement(definition)
      var transactions = statement.transactions
      var label = 'transaction' + (transactions.length === 1 ? '' : 's')
      var separator = '=============================================='

      console.log(separator)
      console.log('Boiler: ' + statement.name())
      console.log(transactions.length + ' ' + label + ' parsed')

      if (statement.transactions.length > 1) {
        console.log('First transaction:', transactions.first().toJSON())
        console.log('Last transaction:', transactions.last().toJSON())
      } else if (statement.transactions.length) {
        console.log('Transaction:', transactions.first())
      }
      console.log(separator)
    } catch (error) {
      console.log('Could not create Statement: ' + error.message)
    }
  }
}
