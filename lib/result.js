module.exports = function (object) {
  return (typeof object === 'function') ? object.call(object) : object
}
