const {
  User,
  sequelize,
  Reward,
  RetweetReward,
  TweetForReward
} = require('../config/database');

const twitterClient = require('../config/twitter');

const exp = module.exports;

/**
 * Search users on Twitter.
 *
 * Return array of coincidences.
 *
 */
exp.searchTwitterUsers = user =>
  twitterClient
    .get('users/search', {
      q: user,
      count: 5,
      include_entities: false
    })
    .then(data => data)
    .catch(err => {
      // TODO logger
      console.log(err);
    });

/**
 * Fetch Twitter user info by its id.
 *
 */
exp.getTwitterUserById = userId =>
  twitterClient
    .get('users/lookup', {
      user_id: userId,
      include_entities: false
    })
    .then(data => data)
    .catch(err => {
      // TODO logger
      console.log(err);
      return [];
    });

/**
 * Fetch Twitter user info by id or screen name
 *
 */
exp.getTwitterUserByIdOrScreenName = options => {
  const optionsReq = { include_entities: false };
  if (options.userId) {
    optionsReq.user_id = options.userId;
  }
  if (options.screenName) {
    optionsReq.screen_name = options.screenName;
  }
  return twitterClient
    .get('users/show', optionsReq)
    .then(res => res.data)
    .catch(err => {
      // TODO logger
      console.log(err);
      return null;
    });
};

/**
 * Check if user already got reward for that retweet
 *
 */
exp.receivedRetweetReward = (userId, tweetForRewardId, transaction) =>
  Reward.findAll({
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

/**
 * Get the list of userIds who retweeted the tweet
 *
 */
exp.getRetweets = retweetId =>
  twitterClient
    .get('statuses/retweeters/ids', {
      id: retweetId,
      count: 2,
      stringify_ids: true
    })
    .then(res => res.data.ids)
    .catch(err => {
      console.log(err);
    });

/**
 * If the user is retweeted, give the user 100 merits as reward
 *
 */

exp.retweetReward = async (userId, tweetForRewardId) => {
  /* check if user already got reward for that retweet */
  const transaction = await sequelize.transaction();

  const reward = await exp.receivedRetweetReward(
    userId,
    tweetForRewardId,
    transaction
  );
  /* got rewards already */
  if (reward.length) {
    throw new Error('Error: User already received reward ');
  }
  const tweetForReward = await TweetForReward.findById(tweetForRewardId);
  if (!tweetForReward) {
    throw new Error('Error: Not the right tweet id');
  }
  /* Get user from database */
  const user = await User.findById(userId, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  // check if the user is in retweeters list
  const retweeters = await exp.getRetweets(tweetForRewardId);
  const retweeterId = user.externalInfo.id.toString();
  if (retweeters.includes(retweeterId)) {
    try {
      user.unopinionatedMerits += 100;
      await user.save({ transaction });
      const newReward = await Reward.create(
        {
          userId,
          merits: 100
        },
        { transaction }
      );
      await RetweetReward.create(
        {
          tweetForRewardId,
          rewardId: newReward.id
        },
        { transaction }
      );
    } catch (err) {
      console.log(err);
      await transaction.rollback();
    }
  } else {
    console.log("You haven't retweeted yet!");
  }
  await transaction.commit();
};

/**
 * Get no rewarded twitter ids
 *
 */
exp.noRewardedTwitterIds = async userId => {
  // get all rewarded tweetids tied to the user
  const rewards = await Reward.findAll({
    where: { userId },
    include: [
      {
        as: 'retweetReward',
        model: RetweetReward,
        required: true
      }
    ]
  }).map(reward => reward.retweetReward.tweetForRewardId);
  // get all tweetids
  const listOfTweetId = (await TweetForReward.findAll())
    .map(tweet => tweet.id)
    .filter(id => !rewards.includes(id));

  return listOfTweetId;
};
