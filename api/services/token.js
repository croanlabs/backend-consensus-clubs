const {Candidate, TokenHolder} = require('../config/database');

const exp = module.exports;

const aBondingCurve = 0.25;

/**
 * Get the token price given the current supply of tokens.
 *
 */
exp.tokenPrice = supply => supply * aBondingCurve;

/**
 * Convert merits to tokens.
 *
 */
exp.meritsToTokensBuy = (merits, supply) => {
  const newSupply = Math.sqrt(
    (2 * merits + supply * exp.tokenPrice(supply)) / aBondingCurve,
  );
  return newSupply - supply;
};

/**
 * Convert tokens to merits.
 *
 */
exp.tokensToMeritsRedeem = (tokenAmount, supply) => {
  const supplyAfter = supply - tokenAmount;
  return (
    (supply * exp.tokenPrice(supply) - supplyAfter * exp.tokenPrice(supplyAfter)) / 2
  );
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
  const tokenAmount = exp.meritsToTokensBuy(commitmentMerits, supply);
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
 * Free a percentage of the candidate tokens a user holds by:
 *    - updating token totals of candidate's row on table Candidates
 *    - updating user's token totals on table TokenHolders
 *      (or deleting the row if percentage is 100%)
 *
 */
exp.freeTokens = async (
  userId,
  candidateId,
  confidence,
  percentage,
  supply,
  transaction,
) => {
  // Update token holder
  const tokenHolder = await TokenHolder.findOne({
    where: {userId, candidateId, confidence},
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  const tokenAmount = (tokenHolder.tokenAmount * percentage) / 100;
  const totalAvailableMerits = exp.tokensToMeritsRedeem(tokenHolder.tokenAmount, supply);

  if (percentage === 100) {
    await tokenHolder.destroy({transaction});
  } else {
    tokenHolder.tokenAmount -= tokenAmount;
    await tokenHolder.save({transaction});
  }

  // Update candidate
  const candidate = await Candidate.findById(candidateId, {
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  const redeemedMerits = exp.tokensToMeritsRedeem(tokenAmount, supply);
  if (confidence) {
    candidate.totalTokensConfidence -= tokenAmount;
    candidate.totalMeritsConfidence -= redeemedMerits;
  } else {
    candidate.totalTokensOpposition -= tokenAmount;
    candidate.totalMeritsOpposition -= redeemedMerits;
  }
  candidate.save({transaction});

  // Calculate the percentage of redeemed merits
  //
  // This percentage is not the same as the token percentage because
  // a bonding curve is used to calculate the value of the tokens which
  // consequently is not constant (depends on the supply).
  const percentageRedeemedMerits = redeemedMerits * 100 / totalAvailableMerits;

  return {tokenAmount, redeemedMerits, percentageRedeemedMerits};
};
