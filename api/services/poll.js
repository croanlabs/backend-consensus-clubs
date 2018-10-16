const config = require('../config');
const {
  Candidate,
  Poll,
  TokenHolder,
  User,
  sequelize,
} = require('../config/database');
const eos = require('../config/eos');
const eosService = require('./eos');
const tokenService = require('./token');

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
  options,
) => {
  let isExistingTransaction = true;
  let transaction;
  if (options && options.transaction) {
    transaction = options.transaction;
  } else {
    transaction = await sequelize.transaction();
    isExistingTransaction = false;
  }
  const Op = sequelize.Op;
  const [candidate, created] = await Candidate.findOrCreate({
    where: { pollId, twitterUser },
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
    transaction.rollback();
    throw 'Error: candidate already exists';
  }
  try {
    const contract = await eos.contract(config.eosUsername);
    const options = {authorization: [`${config.eosUsername}@active`]};
    await contract.newcandidate(
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
    throw 'Error: there were problems while inserting the candidate into the blockchain';
  }
  if (!isExistingTransaction) {
    transaction.commit();
  }
  return candidate;
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
exp.userAddCandidate = async (
  userId,
  pollId,
  name,
  description,
  twitterUser,
  profilePictureUrl,
  confidence,
  commitmentMerits,
) => {
  const user = await User.findById(userId);
  if (user.unopinionatedMerits <= commitmentMerits) {
    throw 'Error: insufficient merits';
  }
  const transaction = await sequelize.transaction();
  const candidate = await exp.addCandidate(
    pollId,
    name,
    description,
    twitterUser,
    profilePictureUrl,
    {
      transaction,
    },
  );
  await exp.expressOpinion(userId, candidate.id, confidence, commitmentMerits, {
    transaction,
  });
  transaction.commit();
  //const isConfidence = confidence === true ? 1 : 0;
  //return eos.contract(config.eosUsername).then(contract => {
  //  const options = {authorization: [`${config.eosUsername}@active`]};
  //  return contract.newcanduser(
  //    userId,
  //    pollId,
  //    name,
  //    description,
  //    twitterUser,
  //    profilePictureUrl,
  //    isConfidence,
  //    commitmentMerits,
  //    options,
  //  );
  //});
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
exp.expressOpinion = async (
  userId,
  candidateId,
  confidence,
  commitmentMerits,
  options,
) => {
  let isExistingTransaction = true;
  let transaction;
  if (options && options.transaction) {
    transaction = options.transaction;
  } else {
    transaction = await sequelize.transaction();
    isExistingTransaction = false;
  }
  const user = await User.findById(userId, {lock: transaction.LOCK});
  if (!user) {
    transaction.rollback();
    throw 'Error creating opinion: user not found';
  }
  if (user.unopinionatedMerits <= commitmentMerits) {
    transaction.rollback();
    throw 'Error: insufficient merits';
  }
  user.unopinionatedMerits -= commitmentMerits;
  user.save({transaction});
  const tokenAmount = await exp.allocateTokens(
    userId,
    candidateId,
    confidence,
    commitmentMerits,
    transaction,
  );
  await exp.createOrUpdateOpinion(userId, candidateId, confidence, tokenAmount);
  transaction.commit();
  // const actionType = confidence ? 'CONFIDENCE' : 'NO_CONFIDENCE';
  // newaction(userId, candidateId, actionType, commitmentMerits);
};

/**
 * TODO
 *
 */
exp.allocateTokens = async (
  userId,
  candidateId,
  confidence,
  commitmentMerits,
  transaction,
) => {
  // Update candidate
  let candidate = await Candidate.findById(candidateId, {transaction});

  const supply = confidence
    ? candidate.totalTokensConfidence
    : candidate.totalTokensOpposition;
  const tokenAmount = tokenService.meritsToTokensBuy(commitmentMerits, supply);
  if (confidence) {
    candidate.totalTokensConfidence += tokenAmount;
    candidate.totalMeritsConfidence += commitmentMerits;
  } else {
    candidate.totalTokensOpposition += tokenAmount;
    candidate.totalMeritsOpposition += commitmentMerits;
  }
  await candidate.save({transaction});

  // Update token holders
  let tokenHolder = await TokenHolder.findOne({
    where: {userId, candidateId, confidence},
    lock: transaction.LOCK,
  });
  if (tokenHolder) {
    tokenHolder.tokenAmount += tokenAmount;
    await tokenHolder.save({transaction});
  } else {
    await TokenHolder.create(
      {userId, candidateId, confidence, tokenAmount},
      {transaction},
    );
  }

  return tokenAmount;
};

/**
 * TODO
 *
 */
exp.createOrUpdateOpinion = (
  userId,
  candidateId,
  confidence,
  commitmentMerits,
) => {
  console.log('creating or updating opinion');
};

/**
 * TODO
 */
exp.expressOpinionBlockchain = (
  userId,
  candidateId,
  confidence,
  commitmentMerits,
) => {
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
