const {
  Notification,
  GeneralNotification,
  PollNotification,
  User,
  UserNotification,
  sequelize,
} = require('../config/database');

const exp = module.exports;

/**
 * Create a notification for all users.
 *
 * Options:
 *    transaction: sequelize transaction to be used in the notification
 *      creation.
 */
exp.notifyAll = async (text, options) => {
  const isLocalTransaction = !options.transaction;
  const insertOptions = options.transaction
    ? {transaction: options.transaction}
    : {transaction: await sequelize.transaction()};

  let notification;
  let genNotification;
  try {
    notification = await Notification.create({text}, insertOptions);
    genNotification = await GeneralNotification.create(
      {
        notificationId: notification.id,
      },
      insertOptions,
    );
  } catch (err) {
    if (isLocalTransaction) {
      await insertOptions.transaction.rollback();
    }
    throw err;
  }
  if (isLocalTransaction) {
    await insertOptions.transaction.commit();
  }
  return [notification.id, genNotification.id];
};

/**
 * Create a poll or poll candidate related notification.
 *
 * Options:
 *    candidateId: specify candidate id if the notification is related
 *      to a poll candidate.
 *    transaction: sequelize transaction to be used in the notification
 *      creation.
 *
 */
exp.notifyPollEvent = async (text, pollId, options) => {
  const isLocalTransaction = !options.transaction;
  const insertOptions = options.transaction
    ? {transaction: options.transaction}
    : {transaction: await sequelize.transaction()};
  const candidateId = options.candidateId || null;

  let notification;
  let pollNotification;
  try {
    notification = await Notification.create({text}, insertOptions);
    pollNotification = await PollNotification.create(
      {
        notificationId: notification.id,
        pollId,
        candidateId,
      },
      insertOptions,
    );
  } catch (err) {
    if (isLocalTransaction) {
      await insertOptions.transaction.rollback();
    }
    throw err;
  }
  if (isLocalTransaction) {
    await insertOptions.transaction.commit();
  }
  return [notification.id, pollNotification.id];
};

/**
 * Create a notification for a user.
 *
 * Options:
 *    transaction: sequelize transaction to be used in the notification
 *      creation.
 */
exp.notifyUser = async (text, userId, options) => {
  const isLocalTransaction = !options.transaction;
  const insertOptions = options.transaction
    ? {transaction: options.transaction}
    : {transaction: await sequelize.transaction()};

  let notification;
  let userNotification;
  try {
    notification = await Notification.create({text}, insertOptions);
    userNotification = await UserNotification.create(
      {
        notificationId: notification.id,
        userId,
      },
      insertOptions,
    );
  } catch (err) {
    if (isLocalTransaction) {
      await insertOptions.transaction.rollback();
    }
    throw err;
  }
  if (isLocalTransaction) {
    await insertOptions.transaction.commit();
  }
  return [notification.id, userNotification.id];
};

/**
 * Get notifications for a user.
 *
 */
exp.getNotifications = async userId => {
  const user = await User.findById(userId);
  const {Op} = sequelize;
  return Notification.findAll({
    where: {
      createdAt: {
        [Op.gte]: user.createdAt,
      }
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: UserNotification,
        required: false,
        where: {userId},
      },
      {
        model: GeneralNotification,
        required: false,
      },
      {
        model: PollNotification,
        required: false,
      },
    ],
  });
}
