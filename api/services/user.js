const config = require('../config');
const eos = require('../config/eos');
const eosService = require('./eos');
const pollService = require('./poll');
const sequelize = require('../config/database').sequelize;
const User = require('../config/database').User;

let exp = (module.exports = {});

/**
 * Find or create a user. If the user is not in the database
 * it is inserted into both database and blockchain.
 *
 */
exp.findOrCreate = (username, externalInfo) => {
  return sequelize.transaction().then(tx => {
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
            await exp.createUserBlockchain(username);
          } catch (err) {
            console.log(err);
            tx.rollback();
            return [null, false];
          }
        }
        tx.commit();
        return result;
      })
      .catch(err => {
        console.log(err);
        tx.rollback();
        return [null, false];
      });
  });
};

/**
 * Insert a user into the table users on the blockchain.
 *
 */
exp.createUserBlockchain = (username) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newuser(username, 1000, options);
  });
};

/**
 * Process a user referral.
 *
 * Who referred the new user gets a pre-determined number of merits.
 *
 */
exp.newReferral = (referredBy) => {
  return eos.contract(config.eosUsername).then(contract => {
    const options = {authorization: [`${config.eosUsername}@active`]};
    return contract.newreferral(referredBy, options);
  });
}

/**
 * Get all the opinions expressed by the user from the opinions table
 * on the blockchain.
 *
 */
exp.getUserOpinions = async (userId, options = {}) => {
  let userOpinions = await eosService.getPagedResults('opinions', userId,
    {
      page: options.page || 1,
      pageSize: options.pageSize || 10,
      indexId: 2 // userId index
    }
  );
  let promises = userOpinions.rows.map(opinion => {
    return eosService.getRowById('candidates', opinion['candidate_id'])
      .then(candidate => {
        opinion.candidate = candidate;
        return opinion;
      });
  });
  await Promise.all(promises);
  return userOpinions;
}
