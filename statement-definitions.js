var statementDefinitions = [
  {
    institution: 'HSBC',
    host: 'www.saas.hsbc.co.uk',
    columns: ['date', 'type', 'description', 'paidOut', 'paidIn', 'balance'],
    dateFormat: 'DD MMM',
    table: function () {
      return document.querySelector('table[summary="This table contains a statement of your account"]')
    },
    date: function () {
      var selectors = [
        // For Previous Statements
        '#content > div.containerMain div.hsbcTextRight',

        // For Recent Transactions
        '#detail-switch > table > tbody > tr:nth-child(3) > td.extTableColumn2'
      ]

      for (var i = 0; i < selectors.length; i++) {
        var dateString = document.querySelector(selectors[i]).textContent
        if (Date.parse(dateString)) return new Date(dateString)
      }
    }
  },
  {
    institution: 'NatWest',
    host: 'www.nwolb.com',
    columns: ['date', 'type', 'description', 'paidIn', 'paidOut', 'balance'],
    dateFormat: 'D MMM YYYY',
    table: function () {
      return window.frames.ctl00_secframe.contentDocument.querySelector('.ItemTable')
    }
  }
]

statementDefinitions.findBy = function (key, value) {
  for (var i = this.length - 1; i >= 0; i--) {
    var definition = this[i]
    if (definition[key] === value) return definition
  }
  return null
}

statementDefinitions.findByHost = function (host) {
  return this.findBy('host', host)
}

module.exports = statementDefinitions
