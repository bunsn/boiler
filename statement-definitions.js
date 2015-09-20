var statementDefinitions = [
  require('./statement-definitions/cater-allen'),
  require('./statement-definitions/hsbc'),
  require('./statement-definitions/natwest')
]

statementDefinitions.findBy = function (key, value) {
  for (var i = this.length - 1; i >= 0; i--) {
    var definition = this[i]
    if (definition[key] === value) return definition
  }
  return null
}

module.exports = statementDefinitions
