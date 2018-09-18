const config = require('../config');
const Notification = require('../models/notification');
const GeneralNotification = require('../models/generalNotification');
const PollNotification = require('../models/pollNotification');
const UserNotification = require('../models/userNotification');

let exp = (module.exports = {});

exp.notifyAll = async text => {
  let notification = await Notification.create({text});
  let genNotification = await GeneralNotification.create({
    notificationId: notification.id,
  });
  return [notification.id, genNotification.id];
};

exp.notifyPollEvent = async (text, pollId, candidateId) => {
  let notification = await Notification.create({text});
  let pollNotification = await PollNotification.create({
    notificationId: notification.id,
    pollId,
    candidateId,
  });
  return [notification.id, pollNotification.id];
};

exp.notifyUser = async (text, userId) => {
  let notification = await Notification.create({text});
  let userNotification = await UserNotification.create({
    notificationId: notification.id,
    userId,
  });
  return [notification.id, userNotification.id];
};
