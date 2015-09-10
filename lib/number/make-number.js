module.exports = function makeNumber (value) {
  return Number(String(value).replace(/[^\d\.-]/g, ''))
}
