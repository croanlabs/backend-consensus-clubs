const Eos = require('eosjs');
const config = require('./config');

let exp = module.exports = {};

/**
 * Configure EOS so API calls can be executed.
 *
 */
function confEos(chainId, keyProvider, host, port) {
  const eosConfig = {
    chainId,
    keyProvider,
    httpEndpoint: `http://${host}:${port}`,
    expireInSeconds: 60,
    broadcast: true,
    verbose: false,
    sign: true
  }
  return Eos(eosConfig);
}

exp.eos = confEos(
  config.eosChainId,
  config.eosUserPrivKey,
  config.eosHost,
  config.eosPort);

exp.testsEos = confEos(
  config.eosChainId,
  config.eosTestsUserPrivKey,
  config.eosTestsHost,
  config.eosTestsPort);
