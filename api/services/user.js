const eos = require('../config/eos');
const User = require('../models/user');

let exp = module.exports = {};

/**
 * Find or create a user. If the user is not in the database
 * it inserts it and creates a user on the blockchain.
 *
 */
exp.findOrCreate = (userName, externalInfo) => {
  User.findOrCreate({
    where: {
      username: profile.username
    },
    defaults: {
      externalInfo: profile
    },
  }).spread((user, created) => {
    if (created) {
      console.log("It's going to create a user on the blockchain");
      eos.contract('user').then(user => {
        user.insert(userName, null, null, 1000)
        .then((res) => {
          console.log(`User creation on the blockchain response: ${res}`);
        }).catch((err) => {
          console.log(`Error creating user: ${err}`)
        })
      }).catch((err) => {
        console.log(`Error setting contract user for user creation\n ${err}`);
      })
    }
    return user;
  });
}
