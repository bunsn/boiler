module.exports = {
  institution: 'NatWest',
  host: 'www.nwolb.com',
  columns: ['date', 'type', 'description', 'paidIn', 'paidOut', 'balance'],
  dateFormat: 'D MMM YYYY',
  rows: function () {
    return window.frames.ctl00_secframe.contentDocument.querySelectorAll('.ItemTable tbody tr')
  }
}
