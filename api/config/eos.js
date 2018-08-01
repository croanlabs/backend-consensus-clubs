const Eos = require('eosjs');
const config = require('./config');

/**
 * Configure EOS so API calls can be executed.
 *
 */
function confEos() {
  const eosConfig = {
    chainId: config.eosChainId,
    keyProvider: config.eosUserPrivKey,
    httpEndpoint: `http://${config.eosHost}:${config.eosPort}`,
    expireInSeconds: 60,
    broadcast: true,
    verbose: false,
    sign: true
  }
  return Eos(eosConfig);
}

module.exports = confEos();
