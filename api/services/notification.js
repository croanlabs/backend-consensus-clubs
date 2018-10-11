const {
  Notification,
  UserNotification,
  GeneralNotification,
  PollNotification,
} = require('../config/database').Notification;

const exp = module.exports;

/**
 * Create a notification for all users.
 *
 */
exp.notifyAll = async text => {
  const notification = await Notification.create({text});
  const genNotification = await GeneralNotification.create({
    notificationId: notification.id,
  });
  return [notification.id, genNotification.id];
};

/**
 * Create a poll or poll candidate related notification.
 * candidateId is optional.
 *
 */
exp.notifyPollEvent = async (text, pollId, candidateId) => {
  const notification = await Notification.create({text});
  const pollNotification = await PollNotification.create({
    notificationId: notification.id,
    pollId,
    candidateId,
  });
  return [notification.id, pollNotification.id];
};

/**
 * Create a notification for a user.
 *
 */
exp.notifyUser = async (text, userId) => {
  const notification = await Notification.create({text});
  const userNotification = await UserNotification.create({
    notificationId: notification.id,
    userId,
  });
  return [notification.id, userNotification.id];
};

/**
 * Get notifications for a user.
 *
 */
exp.getNotifications = async userId =>
  Notification.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: UserNotification,
        required: false,
        where: {userId},
      },
    ],
  });
