module.exports = {
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
}
