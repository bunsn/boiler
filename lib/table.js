function Table (element) {
  this.element = element
}

Table.prototype.rowsToArray = function (rows, options) {
  options = options || {}
  var processRow = options.processRow || id
  var processCell = options.processCell || id

  return map(rows, function (tr, rowIndex, rows) {
    var row = map(tr.cells, function (node, cellIndex, cells) {
      return processCell(nodeText(node), cellIndex, cells, node)
    })

    return processRow(row, rowIndex, rows, tr)
  })
}

Table.prototype.toArray = function () {
  return this.rowsToArray(this.element.querySelectorAll('tbody tr'))
}

/**
 * Squashed and trimmed node text content
 */

function nodeText (node) {
  return squashWhitespace(node.textContent)

  function squashWhitespace (string) {
    return string.replace(/\s{2,}/g, ' ').trim()
  }
}

/**
 * map for NodeLists
 */

function map (array, enumerator) {
  return Array.prototype.map.call(array, enumerator)
}

/**
 * Identity function
 * @returns Its input!
 */

function id (x) { return x }

module.exports = Table
