const eos = require('../config/eos');
const config = require('../config');

let exp = module.exports = {};

/**
 * Get list of polls.
 *
 */
exp.getPolls = () => {
  return eos.getTableRows(
    true,
    config.eosUsername,
    config.eosUsername,
    'polls',
    'primary_key',
    0,
    10,
    10,
    'i64',
    1).then((result) => {
      return result.rows;
    });
}

/**
 * Get poll by id.
 *
 */
exp.getPoll = (pollId) => {
  return eos.getTableRows(
    true,
    config.eosUsername,
    config.eosUsername,
    'polls',
    'primary_key',
    pollId,
    pollId + 1,
    1,
    'i64',
    1).then((result) => {
      if (result.rows.length) {
        return result.rows[0];
      } else {
        return null;
      }
    })
}

/**
 * Insert a poll into the polls table on the blockchain.
 *
 */
exp.createPoll = (question, description) => {
  return eos.contract(config.eosUsername)
    .then(contract => {
      const options = { authorization: [`${config.eosUsername}@active`] };
      return contract.newpoll(question, description, options);
    });
}

/**
 * Insert a poll candidate into the candidates table on the
 * blockchain.
 *
 * This function is likely to be used to create the initial set
 * of polls or to be used by the admin as it does not imply staking
 * any coins on the new option.
 *
 */
exp.addCandidate = (
    pollId,
    name,
    description,
    twitterUser) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options =
      { authorization: [`${config.eosUsername}@active`] };
    return contract.newcandidate(
      pollId, name, description, twitterUser, options);
  });
}

/**
 * Insert a candidate added by a user to the candidates table on
 * the blockchain.
 *
 */
exp.userAddCandidate = (
    userId,
    pollId,
    name,
    description,
    twitterUser,
    confidence,
    amountMerits) => {
  const isConfidence = (confidence === 'true') ? 1 : 0;
  return eos.contract(config.eosUsername).then(contract => {
    const options =
      { authorization: [`${config.eosUsername}@active`] };
    return contract.newcanduser(
      userId,
      pollId,
      name,
      description,
      twitterUser,
      isConfidence,
      amountMerits,
      options);
  });
}
