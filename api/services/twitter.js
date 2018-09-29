const twitterClient = require('../config/twitter');

let exp = (module.exports = {});

/**
 * Search users on Twitter.
 *
 * Return array of coincidences.
 *
 */
exp.searchTwitterUsers = user => {
  return twitterClient.get(
    'users/search',
    {
      q: user,
      count: 5,
      include_entities: false,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      // TODO logger
      console.log(err);
    })
};

/**
 * Fetch Twitter user info by its id.
 *
 */
exp.getTwitterUserById = userId => {
  return twitterClient.get(
    'users/lookup',
    {
      user_id: userId,
      include_entities: false,
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      //TODO logger
      console.log(err);
      return [];
    });
};
