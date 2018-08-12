const config = require('../config');
const eos = require('../config/eos');
const db = require('../config/database');
const User = require('../models/user');

let exp = module.exports = {};

/**
 * Find or create a user. If the user is not in the database
 * it inserts it and creates a user on the blockchain.
 *
 */
exp.findOrCreate = (username, externalInfo) => {
  return new Promise((resolve, reject) => {
    db.transaction().then(function (t) {
      User.findOrCreate({
        where: {
          username
        },
        defaults: {
          externalInfo
        },
        transaction: t
      }).spread((user, created) => {
        if (created) {
          eos.contract(config.eosUsername).then(contract => {
            const options = { authorization: [`${config.eosUsername}@active`] };
            contract.newuser(username, '', '', 1000, options)
            .then((res) => {
              t.commit();
              resolve(user);
            }).catch((err) => {
              t.rollback();
              reject(err);
            })
          }).catch((err) => {
            t.rollback();
            reject(err);
          });
        } else {
          t.commit();
          resolve(user);
        };
      });
    }).catch((err) => {
      reject(err);
    });
  });
};
