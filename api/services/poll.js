const {
  Action,
  ActionType,
  Candidate,
  Opinion,
  Poll,
  User,
  sequelize,
} = require('../config/database');
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
 * Insert a poll into the polls table.
 *
 */
exp.createPoll = async (question, options) =>
  Poll.findOrCreate({
    where: {question},
    options,
  });

/**
 * Insert a poll candidate into the Candidates table.
 *
 * Effects on the database:
 *  - Insert candidate into Candidates table
 *  - Insert token for the new candidate into Tokens table
 *
 */
exp.addCandidate = async (pollId, twitterUser, options = {}) => {
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
    ...options,
  });
  if (!created) {
    throw new Error('Error: candidate already exists');
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
};

/**
 * User expresses an opinion about a poll candidate.
 * Internally the user buys candidate's confidence or no-confidence tokens.
 *
 * Effects on the database:
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
    const tokenAmount = await tokenService.allocateTokens(
      userId,
      candidateId,
      confidence,
      commitmentMerits,
      transaction,
    );
    await exp.updateOpinionForExpression(
      userId,
      candidateId,
      confidence,
      commitmentMerits,
      tokenAmount,
      transaction,
    );

    const actionType = await exp.getActionTypeByName(
      confidence ? 'confidence' : 'opposition',
    );
    await Action.create(
      {
        userId,
        candidateId,
        actionTypeId: actionType.id,
        merits: commitmentMerits,
        tokenAmount,
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
 * Get action type id by name.
 *
 */
exp.getActionTypeByName = async name => {
  const actionType = await ActionType.findOne({
    where: {name},
  });
  if (!actionType) {
    throw new Error('Error: action types not loaded');
  }
  return actionType;
};

/**
 * Create or modify user's opinion on a candidate.
 *
 */
exp.updateOpinionForExpression = async (
  userId,
  candidateId,
  confidence,
  merits,
  tokenAmount,
  transaction,
) => {
  const opinion = await Opinion.findOne({
    where: {userId, candidateId},
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  if (!opinion) {
    await Opinion.create(
      {userId, candidateId, confidence, merits, tokenAmount},
      {transaction},
    );
    return;
  }
  // Opinion exists: update it
  opinion.tokenAmount += tokenAmount;
  opinion.merits += merits;
  if (opinion.tokenAmount !== 0) {
    await opinion.save({transaction});
  } else {
    await opinion.destroy({transaction});
  }
};

/**
 * Modify or delete user's opinion on a candidate. Related to token
 * redemption.
 *
 */
exp.updateOpinionForRedemption = async (
  userId,
  candidateId,
  confidence,
  tokenAmount,
  percentageRedeemedMerits,
  transaction,
) => {
  const opinion = await Opinion.findOne({
    where: {userId, candidateId},
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  if (!opinion) {
    throw new Error(
      `Opinion not found for user ${userId} candidate ${candidateId} and confidence ${confidence}`,
    );
  }
  opinion.tokenAmount -= tokenAmount;
  opinion.merits -= (opinion.merits * percentageRedeemedMerits) / 100;
  if (opinion.tokenAmount !== 0) {
    await opinion.save({transaction});
  } else {
    await opinion.destroy({transaction});
  }
};

/**
 * Redeem a percentage of tokens for a candidate.
 * Internally it exchanges tokens for merits.
 *
 * Effects on the database:
 *   - Increment unopinionated merits of the user on table Users
 *   - Update table TokenHolders to decrease the token amount for the user/candidate
 *        (or delete it if percentage is 100)
 *   - Update table Opinions to decrease the token amount
 *
 */
exp.redeem = async (userId, candidateId, confidence, percentage) => {
  if (percentage > 100 || percentage <= 0) {
    throw new Error(
      'Error: percentage must be higher than 0 and lower or equal to 100.',
    );
  }
  const transaction = await sequelize.transaction();
  try {
    const candidate = await Candidate.findById(candidateId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    const supply = confidence
      ? candidate.totalTokensConfidence
      : candidate.totalTokensOpposition;

    // Update candidate and token holder
    const {
      tokenAmount,
      redeemedMerits,
      percentageRedeemedMerits,
    } = await tokenService.freeTokens(
      userId,
      candidateId,
      confidence,
      percentage,
      supply,
      transaction,
    );

    // Update opinion
    await exp.updateOpinionForRedemption(
      userId,
      candidateId,
      confidence,
      tokenAmount,
      percentageRedeemedMerits,
      transaction,
    );

    // Create action
    const actionType = await exp.getActionTypeByName('redemption');
    await Action.create(
      {userId, candidateId, actionTypeId: actionType.id, merits: redeemedMerits, tokenAmount},
      {transaction},
    );

    // Update user
    const user = await User.findById(userId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    user.unopinionatedMerits += redeemedMerits;
    await user.save({transaction});
  } catch (err) {
    // TODO logger
    console.log(err);
    transaction.rollback();
    throw new Error('Error redeeming benefits');
  }
  transaction.commit();
};
