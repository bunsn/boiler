/**
 * Converts a table node to a 2D array
 */

function tableToArray (table, options) {
  options = options || {}
  var processRow = options.processRow || id
  var processCell = options.processCell || id

  return map(table.querySelectorAll('tbody tr'), function (tr, rowIndex, rows) {
    var row = map(tr.cells, function (node, cellIndex, cells) {
      return processCell(nodeText(node), cellIndex, cells, node)
    })

    return processRow(row, rowIndex, rows, tr)
  })
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

module.exports = tableToArray
