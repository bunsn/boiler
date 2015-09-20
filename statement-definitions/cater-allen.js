module.exports = {
  institution: 'Cater Allen',
  host: 'www.caterallenonline.co.uk',
  columns: ['date', 'description', 'paidOut', 'paidIn', 'balance'],
  dateFormat: 'DDMMMYYYY',
  rows: function () {
    return document.querySelectorAll('table[summary="Table consists of Date, Reference, Payments, Reciepts and Balance columns, displaying recent account transactions"] tbody:nth-of-type(2) tr')
  }
}
