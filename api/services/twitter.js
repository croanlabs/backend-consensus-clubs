const { User, sequelize } = require('../config/database');

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
 * get the list of userIds who retweeted the tweet
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
 * check if the user is retweeted
 *
 * if yes, give the user 100 merits as reward
 */

exp.retweetReward = async (userId, tweetId) => {
  /* check if user already got reward for that retweet */
  /* got rewards already */
  const user = await User.findById(userId);
  // if (null) {
  //   /* yes throw err */
  //   throw new Error('Error: User already got reward');
  // } else {
  /* no -> check if userId is in retweeters list */
  const transaction = await sequelize.transaction();

  const retweeters = await exp.getRetweets(tweetId);
  console.log(retweeters);
  const tweeterId = user.externalInfo.id.toString();
  console.log(tweeterId);
  if (retweeters.includes(tweeterId)) {
    /* Get user from database */
    /* start transaction */
    /* Insert row in table RetweetRewords */

    try {
      /* Give reword to the user (accumulate merits on table Users) */
      /* (commit transaction) */
      user.unopinionatedMerits += 100;
      await user.save({ transaction });
    } catch (err) {
      console.log(err);
      await transaction.rollback();
    }
  } else {
    console.log("You haven't retweeted yet!");
  }
  await transaction.commit();
};
