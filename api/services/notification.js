const config = require('../config');
const db = require('../config/database');
const Notification = db.Notification;
const UserNotification = db.UserNotification;
const GeneralNotification = db.GeneralNotification;
const PollNotification = db.PollNotification;

let exp = (module.exports = {});

/**
 * Create a notification for all users.
 *
 */
exp.notifyAll = async text => {
  let notification = await Notification.create({text});
  let genNotification = await GeneralNotification.create({
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
  let notification = await Notification.create({text});
  let pollNotification = await PollNotification.create({
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
  let notification = await Notification.create({text});
  let userNotification = await UserNotification.create({
    notificationId: notification.id,
    userId,
  });
  return [notification.id, userNotification.id];
};

/**
 * Get notifications for a user.
 *
 * The filters parameter can have the following filters:
 *  - polls:
 *      Array of poll ids.
 *  - candidates:
 *      Array of candidate ids.
 *  - offset:
 *      Offset of notifications for pagination.
 *  - limit
 *      Max number of notifications to get. Max is 10.
 */
exp.getNotifications = async (userId, filters = {}) => {
  if (!filters.offset || filters.offset < 0) {
    filters.offset = 0;
  }
  if (!filters.limit || filters.limit < 0 || filters.limit > 10) {
    filters.limit = 10;
  }
  return Notification.findAll({
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
        //where: {userId},
      },
      {
        model: PollNotification,
        required: false,
        //where: {userId},
      },
    ],
    offset: filters.offset,
    limit: filters.limit
  });
};
