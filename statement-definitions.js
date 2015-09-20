var statementDefinitions = [
  {
    institution: 'Cater Allen',
    host: 'www.caterallenonline.co.uk',
    columns: ['date', 'description', 'paidOut', 'paidIn', 'balance'],
    dateFormat: 'DDMMMYYYY',
    rows: function () {
      return document.querySelectorAll('table[summary="Table consists of Date, Reference, Payments, Reciepts and Balance columns, displaying recent account transactions"] tbody:nth-of-type(2) tr')
    }
  },
  {
    institution: 'HSBC',
    host: 'www.saas.hsbc.co.uk',
    columns: ['date', 'type', 'description', 'paidOut', 'paidIn', 'balance'],
    dateFormat: 'DD MMM',
    rows: function () {
      return document.querySelectorAll('table[summary="This table contains a statement of your account"] tbody tr')
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
    rows: function () {
      return window.frames.ctl00_secframe.contentDocument.querySelectorAll('.ItemTable tbody tr')
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
