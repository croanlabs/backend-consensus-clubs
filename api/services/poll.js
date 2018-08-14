const eos = require('../config/eos');
const config = require('../config');

let exp = module.exports = {};

exp.getPolls = () => {
  return [];
}

exp.getPoll = (pollId) => {
  return {};
}

exp.createPoll = (question, description) => {
  return eos.contract(config.eosUsername)
    .then(contract => {
      const options = { authorization: [`${config.eosUsername}@active`] };
      return contract.newpoll(question, description, options);
    });
}
