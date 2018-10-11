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
  .catch((err) => {
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
  .catch((err) => {
    // TODO logger
    console.log(err);
    return [];
  });
