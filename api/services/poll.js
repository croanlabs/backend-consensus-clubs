const eos = require('../config/eos');
const eosService = require('./eos');
const config = require('../config');

let exp = module.exports = {};

/**
 * Get list of polls with their candidates.
 *
 */
exp.getPolls = async () => {
  let pollRes = await eosService.getPagedResults('polls', 0);
  let polls;
  if (pollRes.rows.length) {
    polls = pollRes.rows;
  } else {
    return null;
  }
  let candidatesPromises = [];
  polls.forEach(p => {
    candidatesPromises.push(exp.getPollCandidates(p.id));
  });
  return Promise.all(candidatesPromises).then(candidates => {
    for (let i = 0; i < polls.length; i++) {
      polls[i].candidates = candidates[i];
    }
    return polls;
  });
};

/**
 * Get poll by id with its candidates.
 *
 */
exp.getPoll = pollId => {
  return Promise.all([
    eosService.getRowById('polls', pollId),
    exp.getPollCandidates(pollId),
  ]).then(res => {
    let poll = res[0];
    let candidatesRes = res[1];
    if (!poll) {
      return null;
    }
    poll.candidates = candidatesRes;
    return poll;
  });
};

exp.getPollCandidates = pollId => {
  return eosService.getRowsUsingIndex('candidates', pollId, 2).then(res => {
    // FIXME when query using secondary index is working properly
    // this filter will not be necessary anymore.
    return res.filter(c => c['poll_id'] == pollId);
  });
};

/**
 * Insert a poll into the polls table on the blockchain.
 *
 */
exp.createPoll = (question, description) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newpoll(question, description, options);
  });
};

/**
 * Insert a poll candidate into the candidates table on the
 * blockchain.
 *
 * This function is likely to be used to create the initial set
 * of polls or to be used by the admin as it does not imply staking
 * any coins on the new option.
 *
 * Effects on the blockchain:
 *  - Insert candidate into candidates table
 *  - Insert token for the new candidate into tokens table
 *
 */
exp.addCandidate = (pollId, name, description, twitterUser) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newcandidate(
      pollId,
      name,
      description,
      twitterUser,
      options,
    );
  });
};

/**
 * Insert a candidate added by a user to the candidates table on
 * the blockchain.
 *
 * Effects on the blockchain:
 *  - Insert candidate into candidates table adding the new tokens
 *    for the user that proposes the candidate
 *  - Insert token for the new candidate into tokens table
 *  - Update the number of unopinionated merits the user has
 *  - Insert opinion into opinions table
 *  - Insert action into actions table
 *
 */
exp.userAddCandidate = (
  userId,
  pollId,
  name,
  description,
  twitterUser,
  confidence,
  commitmentMerits,
) => {
  const isConfidence = confidence === true ? 1 : 0;
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newcanduser(
      userId,
      pollId,
      name,
      description,
      twitterUser,
      isConfidence,
      commitmentMerits,
      options,
    );
  });
};

/**
 * User expresses an opinion about a poll candidate.
 * Internally the user buys candidate's confidence or no-confidence tokens.
 *
 * Effects on the blockchain:
 *  - Update token holders for the candidate on table tokens
 *  - Update the token totals on the candidates table
 *  - Update the number of unopinionated merits the user has
 *  - Create/update opinion on the opinions table
 *  - Insert action into actions table
 *
 */
exp.expressOpinion = (userId, candidateId, confidence, commitmentMerits) => {
  const isConfidence = confidence == true ? 1 : 0;
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newopinion(
      userId,
      candidateId,
      isConfidence,
      commitmentMerits,
      options,
    );
  });
};

/**
 * Redeem benefits. Internally it exchanges tokens for merits.
 *
 * Effects on the blockchain:
 *  - Update token holders for the candidate on table tokens
 *  - Update the token totals on the candidates table
 *  - Update the number of unopinionated merits the user has
 *  - Update/delete opinion on the opinions table
 *  - Add action to actions table
 *
 */
exp.redeem = (userId, candidateId, confidence, percentage) => {
  const isConfidence = confidence == true ? 1 : 0;
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.redeem(
      userId,
      candidateId,
      isConfidence,
      percentage,
      options,
    );
  });
};
