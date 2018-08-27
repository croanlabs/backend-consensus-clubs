const config = require('../config');
const eos = require('../config/eos');
const db = require('../config/database');
const User = require('../models/user');

let exp = (module.exports = {});

/**
 * Find or create a user. If the user is not in the database
 * it inserts it and creates a user on the blockchain.
 *
 */
exp.findOrCreate = (username, externalInfo) => {
  console.log(externalInfo);
  return db.transaction().then(tx => {
    return User.findOrCreate({
      where: {
        username,
      },
      defaults: {
        externalInfo,
      },
      transaction: tx,
    })
      .then(async result => {
        const [user, created] = result;
        if (created) {
          try {
            await exp.createUserBlockchain(username, externalInfo);
          } catch (err) {
            console.log(err);
            tx.rollback();
            return null;
          }
        }
        tx.commit();
        return user;
      })
      .catch(err => {
        console.log(err);
        tx.rollback();
        return null;
      });
  });
};

/**
 * Insert a user into the table users on the blockchain.
 *
 */
exp.createUserBlockchain = (username, externalInfo) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newuser(username, 1000, options);
  });
};
