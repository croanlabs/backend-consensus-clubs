const config = require('../config');
const { Candidate, Poll, sequelize} = require('../config/database');
const eos = require('../config/eos');
const eosService = require('./eos');

const exp = (module.exports = {});

/**
 * Get list of polls with their candidates.
 *
 */
exp.getPolls = async () => {
  const res = await Poll.findAll({
    include: [
      {
        model: Candidate,
        as: 'candidates',
        required: false,
      },
    ],
  });
  return res;
};

/**
 * Get poll by id with its candidates.
 *
 */
exp.getPoll = async pollId => {
  const res = await Poll.find({
    where: {
      id: userDeviceId,
    },
    include: [
      {
        model: Candidate,
        as: 'candidates',
        required: false,
      },
    ],
  });
  return res.get({plain: true});
};

/**
 * Insert a poll into the polls table on the relational database and blockchain.
 *
 */
exp.createPoll = async question => {
    const transaction = await sequelize.transaction();
    const [poll, created] = await Poll.findOrCreate({
      where: {question},
      transaction,
    });
    if (!created) {
      transaction.commit();
      return;
    }
    const options = {authorization: [`${config.eosUsername}@active`]};
    try {
      const contract = await eos.contract(config.eosUsername);
      await contract.newpoll(question, options);
    } catch (error) {
      // TODO logger
      console.log(error);
      transaction.rollback();
    }
    transaction.commit();
};

/**
 * Insert a poll candidate into the Candidates table.
 *
 * This function is likely to be used to create the initial set
 * of polls or to be used by the admin as it does not imply staking
 * any coins on the new option.
 *
 * Effects on the database:
 *  - Insert candidate into Candidates table
 *  - Insert token for the new candidate into Tokens table
 *
 */
exp.addCandidate = async (
  pollId,
  name,
  description,
  twitterUser,
  profilePictureUrl,
) => {
  const transaction = await sequelize.transaction();
  const Op = sequelize.Op;
  const [candidate, created] = await Candidate.findOrCreate({
    where: {
      [Op.and]: [{pollId: pollId}, {twitterUser: twitterUser}],
    },
    defaults: {
      pollId,
      name,
      description,
      twitterUser,
      profilePictureUrl,
      totalTokensConfidence: 0,
      totalTokensOpposition: 0,
      totalMeritsConfidence: 0,
      totalMeritsOpposition: 0,
    },
    transaction,
  });
  if (!created) {
    transaction.commit();
    return;
  }
  try {
    const contract = await eos.contract(config.eosUsername);
    const options = { authorization: [`${config.eosUsername}@active`] };
    contract.newcandidate(
      pollId,
      name,
      description,
      twitterUser,
      profilePictureUrl,
      options,
    );
  } catch (err) {
    // TODO logger
    console.log(err);
    transaction.callback();
    return;
  }
  transaction.commit();
};

/**
 * Insert a candidate added by a user to the Candidates table.
 *
 * Effects on the database:
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
  profilePictureUrl,
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
      profilePictureUrl,
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
