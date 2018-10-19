const config = require('../config');
const {
  Action,
  ActionType,
  Candidate,
  Opinion,
  Poll,
  TokenHolder,
  User,
  sequelize,
} = require('../config/database');
const eos = require('../config/eos');
const tokenService = require('./token');
const twitterService = require('./twitter');
const userService = require('./user');

const exp = module.exports;

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
      id: pollId,
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
  const created = await Poll.findOrCreate({
    where: {question},
    transaction,
  })[1];
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
exp.addCandidate = async (pollId, twitterUser, options) => {
  let isLocalTransaction = true;
  let transaction;
  if (options && options.transaction) {
    ({ transaction } = options);
    isLocalTransaction = false;
  } else {
    transaction = await sequelize.transaction();
  }
  console.log(twitterUser);
  const candTwitter = await twitterService.getTwitterUserByIdOrScreenName({
    screenName: twitterUser,
  });
  const [candidate, created] = await Candidate.findOrCreate({
    where: {pollId, twitterUser},
    defaults: {
      pollId,
      name: candTwitter.name,
      description: candTwitter.description,
      twitterUser,
      profilePictureUrl: candTwitter.profile_image_url,
      totalTokensConfidence: 0,
      totalTokensOpposition: 0,
      totalMeritsConfidence: 0,
      totalMeritsOpposition: 0,
    },
    transaction,
  });
  if (!created) {
    transaction.rollback();
    throw new Error('Error: candidate already exists');
  }
  try {
    const contract = await eos.contract(config.eosUsername);
    const eosOptions = {authorization: [`${config.eosUsername}@active`]};
    await contract.newcandidate(
      pollId,
      candTwitter.name,
      candTwitter.description,
      twitterUser,
      candTwitter.profile_image_url,
      eosOptions,
    );
  } catch (err) {
    // TODO logger
    console.log(err);
    transaction.rolllback();
    throw new Error('Error: there were problems while inserting the candidate into the blockchain');
  }
  if (isLocalTransaction) {
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
  twitterUser,
  confidence,
  commitmentMerits,
) => {
  const user = await User.findById(userId);
  if (user.unopinionatedMerits <= commitmentMerits) {
    throw new Error('Error: insufficient merits');
  }
  const transaction = await sequelize.transaction();
  try {
    const candidate = await exp.addCandidate(pollId, twitterUser, {
      transaction,
    });
    await exp.expressOpinion(
      userId,
      candidate.id,
      confidence,
      commitmentMerits,
      {
        transaction,
      },
    );
  } catch (err) {
    transaction.rollback();
    throw err;
  }
  transaction.commit();
  // const isConfidence = confidence === true ? 1 : 0;
  // return eos.contract(config.eosUsername).then(contract => {
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
  // });
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
  let isLocalTransaction = true;
  let transaction;
  if (options && options.transaction) {
    ({transaction} = options);
    isLocalTransaction = false;
  } else {
    transaction = await sequelize.transaction();
  }

  // Try to perform all the database access operations.
  // If any of them throw an error rollback the rollback the transaction.
  try {
    await userService.updateUserMerits(userId, -commitmentMerits, {
      transaction,
    });
    const tokenAmount = await exp.allocateTokens(
      userId,
      candidateId,
      confidence,
      commitmentMerits,
      transaction,
    );
    await exp.createOrUpdateOpinion(
      userId,
      candidateId,
      confidence,
      tokenAmount,
      transaction,
    );

    const actionTypeName = confidence ? 'confidence' : 'opposition';
    const actionType = await ActionType.findOne({
      where: {name: actionTypeName},
    });
    if (!actionType) {
      transaction.rollback();
      throw new Error('Error: action types not loaded');
    }
    await Action.create(
      {
        userId,
        candidateId,
        actionTypeId: actionType.id,
        merits: commitmentMerits,
      },
      {transaction},
    );
    if (isLocalTransaction) {
      transaction.commit();
    }
  } catch (err) {
    if (isLocalTransaction) {
      transaction.rollback();
    }
    throw err;
  }
};

/**
 * Allocate candidate tokens for a user.
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
  const candidate = await Candidate.findById(candidateId, {transaction});
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
  const tokenHolder = await TokenHolder.findOne({
    where: {userId, candidateId, confidence},
    lock: transaction.LOCK.UPDATE,
    transaction,
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
 * Create or update the opinion of the user about a candidate.
 *
 * If the user had already expressed an opinion about a candidate
 * that opinion is updated accumulating the tokens of the new opinion,
 * otherwise it inserts a new opinion.
 *
 */
exp.createOrUpdateOpinion = async (
  userId,
  candidateId,
  confidence,
  tokenAmount,
  transaction,
) => {
  const opinion = await Opinion.findOne({
    where: {userId, candidateId},
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  if (opinion) {
    opinion.tokenAmount += tokenAmount;
    await opinion.save({transaction});
  } else {
    await Opinion.create(
      {userId, candidateId, confidence, tokenAmount},
      {transaction},
    );
  }
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
  const isConfidence = confidence === true ? 1 : 0;
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
  const isConfidence = confidence === true ? 1 : 0;
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
