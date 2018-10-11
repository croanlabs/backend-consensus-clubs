const exp = module.exports;

exp.sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
