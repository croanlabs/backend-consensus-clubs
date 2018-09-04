let exp = module.exports = {};

exp.sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
