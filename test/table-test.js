var assert = require('assert')
var Table = require('../lib/table')
var sinon = require('sinon')
var spy = sinon.spy

var element = document.createElement('table')
element.innerHTML = [
  '<tbody>',
  '  <tr>',
  '    <td>Hello</td>',
  '    <td>',
  '      World',
  '    </td>',
  '  </tr>',
  '<tbody>'
].join('\n')

describe('Table', function () {
  describe('#rowsToArray', function () {
    var rows

    beforeEach(function () {
      rows = element.querySelectorAll('tbody tr')
    })

    it('parses a node list of trs', function () {
      assert.deepEqual(Table.prototype.rowsToArray(rows), [['Hello', 'World']])
    })

    it('calls a custom row processor', function () {
      var processRow = spy()
      Table.prototype.rowsToArray(rows, { processRow: processRow })
      assert(processRow.called)
      processRow.reset()
    })

    it('calls a custom cell processor', function () {
      var processCell = spy()
      Table.prototype.rowsToArray(rows, { processCell: processCell })
      assert(processCell.called)
      processCell.reset()
    })
  })

  describe('#toArray', function () {
    it('parses its own rows', function () {
      var table = new Table(element)
      assert.deepEqual(table.toArray(), [['Hello', 'World']])
    })
  })
})
