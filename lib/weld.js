/**
 * Maps keys to values
 * @param {Array} data - An array of raw values
 * @param {Array} keys - An array of keys
 * @returns {Object}
 */

function weld (keys, values) {
  var object = {}
  for (var i = keys.length - 1; i >= 0; i--) object[keys[i]] = values[i]
  return object
}

module.exports = weld
