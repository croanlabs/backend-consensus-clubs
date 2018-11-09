const {
  Notification,
  NotificationTemplate,
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
 *    notificationTemplateCode: code of the template to be used for the notification
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
    notification = await Notification.create(
      {
        notificationTemplateId: await exp.getNotificationTemplateIdByCode(
          options.notificationTemplateCode,
        ),
        text,
      },
      insertOptions,
    );
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
 *    notificationTemplateCode: code of the template to be used for the notification
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
    notification = await Notification.create(
      {
        notificationTemplateId: await exp.getNotificationTemplateIdByCode(
          options.notificationTemplateCode,
        ),
        text,
      },
      insertOptions,
    );
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
 *    notificationTemplateCode: code of the template to be used for the notification
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
    notification = await Notification.create(
      {
        notificationTemplateId: await exp.getNotificationTemplateIdByCode(
          options.notificationTemplateCode,
        ),
        text,
      },
      insertOptions,
    );
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
 * Get all notifications for a user, including:
 *  - user notifications: specifically for the user.
 *  - general notifications: for every user.
 *  - poll notifications: associated with polls that can be interesting
 *    for the user.
 *
 */
exp.getNotifications = async userId => {
  const user = await User.findById(userId);
  const data = await Promise.all([
    exp.getUserNotifications(userId, user.createdAt),
    exp.getGeneralNotifications(user.createdAt),
    exp.getPollNotifications(user.createdAt),
  ]);
  const notifications = [].concat(...data);
  notifications.sort((a, b) => b.createdAt - a.createdAt);
  return exp.flattenNotifications(notifications, new Date(user.lastSeen));
};

/**
 * Get notifications that where specifically created for a user,
 * such us the welcome message or a reward for retweeting.
 *
 */
exp.getUserNotifications = (userId, dateFrom) => {
  const {Op} = sequelize;
  return Notification.findAll({
    where: {
      createdAt: {
        [Op.gte]: dateFrom,
      },
    },
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      {
        as: 'userNotification',
        model: UserNotification,
        required: true,
        where: {userId},
      },
      {
        as: 'notificationTemplate',
        model: NotificationTemplate,
        required: false,
      },
    ],
  });
};

/**
 * Get notifications created for all users.
 *
 */
exp.getGeneralNotifications = dateFrom => {
  const {Op} = sequelize;
  return Notification.findAll({
    where: {
      createdAt: {
        [Op.gte]: dateFrom,
      },
    },
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      {
        as: 'generalNotification',
        model: GeneralNotification,
        required: true,
      },
      {
        as: 'notificationTemplate',
        model: NotificationTemplate,
        required: false,
      },
    ],
  });
};

/**
 * Get notifications created for all users.
 *
 * FIXME pass parameter with the interests of a user
 * and just return notifications related to that user's
 * polls.
 *
 */
exp.getPollNotifications = dateFrom => {
  const {Op} = sequelize;
  return Notification.findAll({
    where: {
      createdAt: {
        [Op.gte]: dateFrom,
      },
    },
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      {
        as: 'pollNotification',
        model: PollNotification,
        required: true,
      },
      {
        as: 'notificationTemplate',
        model: NotificationTemplate,
        required: false,
      },
    ],
  });
};

/**
 * Flattens the result of the notifications query.
 *
 */
exp.flattenNotifications = (notifications, lastSeen) =>
  notifications.map(notification => {
    const res = {
      id: notification.id,
      text: notification.text,
      createdAt: notification.createdAt,
    };
    if (notification.pollNotification) {
      res.pollId = notification.pollNotification.pollId;
    }
    if (
      notification.pollNotification &&
      notification.pollNotification.candidateId
    ) {
      res.candidateId = notification.pollNotification.candidateId;
    }
    if (notification.notificationTemplate) {
      res.templateCode = notification.notificationTemplate.code;
      res.templateText = notification.notificationTemplate.text;
      res.icon = notification.notificationTemplate.icon;
    }
    res.seen = notification.createdAt <= lastSeen;
    return res;
  });

/**
 * Get id of the notification template by code.
 *
 */
exp.getNotificationTemplateIdByCode = async code => {
  if (!code) {
    return null;
  }
  const template = await NotificationTemplate.findOne({where: {code}});
  if (!template) {
    return null;
  }
  return template.id;
};
