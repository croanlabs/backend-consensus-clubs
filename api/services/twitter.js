const twitterClient = require('../config/twitter');

const exp = module.exports;

/**
 * Search users on Twitter.
 *
 * Return array of coincidences.
 *
 */
exp.searchTwitterUsers = user => twitterClient
    .get('users/search', {
      q: user,
      count: 5,
      include_entities: false,
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
exp.getTwitterUserById = userId => twitterClient
  .get('users/lookup', {
    user_id: userId,
    include_entities: false,
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
