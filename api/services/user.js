const notificationService = require('./notification');
const {Candidate, Opinion, User, sequelize} = require('../config/database');

const exp = module.exports;

/**
 * Find or create a user.
 *
 */
exp.findOrCreate = async (username, externalInfo) => {
  const transaction = await sequelize.transaction();
  let result;
  try {
    result = await User.findOrCreate({
      where: {
        username,
      },
      defaults: {
        externalInfo,
        unopinionatedMerits: 1000,
        lastSeen: new Date(),
      },
      transaction,
    });
    const [user, created] = result;
    if (created) {
      await notificationService.notifyUser(
        'You have 1000 free merits to start playing!',
        user.id,
        {
          notificationTemplateCode: 'welcome',
          transaction,
        },
      );
    }
  } catch (err) {
    console.log(err);
    await transaction.rollback();
    return [null, false];
  }
  await transaction.commit();
  return result;
};

exp.getById = id => User.findById(id);

/**
 * Update the number of unopinionated merits the user has.
 *
 * Pass a positive number of merits in order to increase the
 * unopinionated merits and a negative number to decrease it.
 *
 */
exp.updateUserMerits = async (userId, merits, options) => {
  let optionsUpdate = {};
  if (options && options.transaction) {
    optionsUpdate = {
      lock: options.transaction.LOCK.UPDATE,
      transaction: options.transaction,
    };
  }
  const user = await User.findById(userId, optionsUpdate);
  if (!user) {
    throw new Error('Error updating merits: user not found');
  }
  if (user.unopinionatedMerits <= merits) {
    throw Error('Error: insufficient merits');
  }
  user.unopinionatedMerits += merits;
  user.save(optionsUpdate);
};

/**
 * Get all the opinions expressed by the user from the opinions table.
 *
 */
exp.getUserOpinions = userId =>
  Opinion.findAll({
    where: {userId},
    include: [
      {
        model: Candidate,
        as: 'candidate',
        required: true,
      },
    ],
  });

/**
 * Update lastSeen field of Users table.
 *
 */
exp.updateLastSeen = async userId => {
  const user = await User.findById(userId);
  user.lastSeen = new Date();
  await user.save();
};
