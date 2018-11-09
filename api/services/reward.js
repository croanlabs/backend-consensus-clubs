const {
  User,
  sequelize,
  Reward,
  RetweetReward,
  TweetForReward,
  ReferralReward
} = require('../config/database');

const twitterService = require('./twitter');
const notificationService = require('./notification');

const exp = module.exports;

/**
 * check if user already got reward for that retweet
 *
 */
exp.checkRetweetRewarded = async (userId, tweetForRewardId, transaction) => {
  const reward = await Reward.findAll({
    where: { userId },
    lock: transaction.LOCK.UPDATE,
    include: [
      {
        as: 'retweetReward',
        model: RetweetReward,
        where: { tweetForRewardId },
        required: true
      }
    ]
  });
  if (reward.length) {
    throw new Error('Error: User already received reward ');
  }
};

/**
 * check if user already got reward for that referral
 *
 */
exp.checkReferralRewarded = async (userId, tweetForRewardId, transaction) => {
  const reward = await Reward.findAll({
    where: { userId },
    lock: transaction.LOCK.UPDATE,
    include: [
      {
        as: 'referalReward',
        model: ReferralReward,
        where: { tweetForRewardId },
        required: true
      }
    ]
  });
  if (reward.length) {
    throw new Error('Error: User already received reward ');
  }
};

/**
 *  Give merits as rewards to the user
 *  and add a new row on both Reward and retweetReward tables
 *
 */
exp.receiveRetweetRewards = async (
  user,
  userId,
  tweetForRewardId,
  transaction
) => {
  const merits = 100;
  const userInfo = user;
  userInfo.unopinionatedMerits += 100;
  await user.save({ transaction });
  const newReward = await Reward.create({ userId, merits }, { transaction });
  await RetweetReward.create(
    {
      tweetForRewardId,
      rewardId: newReward.id
    },
    { transaction }
  );
};

/**
 *  Give merits as rewards to the user
 *  and add a new row on both Reward and referralReward tables
 *
 */
exp.receiveReferralRewards = async (
  user,
  userId,
  referredUserId,
  transaction
) => {
  const merits = 500;
  const userInfo = user;
  userInfo.unopinionatedMerits += merits;
  await user.save({ transaction });
  const newReward = await Reward.create({ userId, merits }, { transaction });
  await ReferralReward.create(
    {
      referredUserId,
      rewardId: newReward.id
    },
    { transaction }
  );
};

/**
 * If the user is retweeted, give the user 100 merits as reward
 *
 */
exp.retweetReward = async (userId, tweetForRewardId) => {
  /* check if user already got reward for that kind of reward */
  const transaction = await sequelize.transaction();
  await exp.checkRetweetRewarded(userId, tweetForRewardId, transaction);

  /* check if the tweet id exists in tweetForReward table */
  const tweetForReward = await TweetForReward.findById(tweetForRewardId);
  if (!tweetForReward) {
    throw new Error('Error: Not the right tweet id');
  }

  /* Get user from database */
  const user = await User.findById(userId, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  /* check if the user is in retweeters list */
  const retweeters = await twitterService.getRetweets(tweetForRewardId);
  const retweeterId = user.externalInfo.id.toString();
  if (!retweeters.includes(retweeterId)) {
    throw Error('Error: Tweet was not retweeted');
  }
  try {
    await exp.receiveRetweetRewards(
      user,
      userId,
      tweetForRewardId,
      transaction
    );

    // execute notification
    await notificationService.notifyUser(
      'You have received 100 merits as retweet bonus!',
      user.id,
      {
        notificationTemplateCode: 'retweet_bonus',
        transaction
      }
    );
  } catch (err) {
    console.log(err);
    await transaction.rollback();
    throw Error('Error: retweet reward process failed');
  }
  await transaction.commit();
};

/**
 * Process a user referral.
 * The user who referred the new user
 * gets a pre-determined number of merits.
 *
 */
exp.referralReward = async (userId, referredUserId) => {
  /* check if user already got reward for that kind of reward */
  const transaction = await sequelize.transaction();
  exp.checkReferralRewarded(userId, referredUserId, transaction);

  /* Get user from database */
  const user = await User.findById(userId, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });

  /* check if the referred user (new user) is in user table */
  const referredUser = await User.findById(referredUserId);
  if (referredUser) {
    try {
      exp.receiveReferralRewards(user, userId, referredUserId, transaction);
      /* execute notification */
      await notificationService.notifyUser(
        `${referredUser.username} has joined Consensus Clubs!`,
        user.id,
        {
          notificationTemplateCode: 'referral_success',
          transaction
        }
      );
    } catch (err) {
      console.log(err);
      await transaction.rollback();
      throw Error('Error: referral reward process failed');
    }
  } else {
    console.log("You haven't retweeted yet!");
  }

  await transaction.commit();
};
