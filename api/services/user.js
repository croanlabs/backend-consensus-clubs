const config = require('../config');
const eos = require('../config/eos');
const User = require('../models/user');

let exp = module.exports = {};

/**
 * Find or create a user. If the user is not in the database
 * it inserts it and creates a user on the blockchain.
 *
 */
exp.findOrCreate = (username, externalInfo) => {
  return new Promise((resolve, reject) => {
    User.findOrCreate({
      where: {
        username
      },
      defaults: {
        externalInfo
      },
    }).spread((user, created) => {
      if (created) {
        eos.contract(config.eosUsername).then(contract => {
          const options = { authorization: [`${config.eosUsername}@active`] };
          contract.insertuser(username, '', '', 1000, options)
          .then((res) => {
            resolve(user);
          }).catch((err) => {
            reject(err);
          })
        }).catch((err) => {
          reject(err);
        })
      } else {
        resolve(user);
      }
    });
  });
}
