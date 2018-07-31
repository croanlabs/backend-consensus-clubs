const Eos = require('eosjs');
const config = require('./config');

let exp = module.exports = {};

/**
 * Configure EOS so API calls can be executed.
 *
 */
function confEos() {
  // Environment variables are automatically available to discover each
  // service that was created before this pod (nodejs pod) was
  // instantiated.
  const eosConfig = {
    chainId: config.eosChainId,
    keyProvider: config.eosEosioPrivKey,
    httpEndpoint: `http://${config.eosHost}:${config.eosPort}`,
    expireInSeconds: 60,
    broadcast: true,
    verbose: false,
    sign: true
  }
  return Eos(eosConfig);
}

exp.eos = confEos();
