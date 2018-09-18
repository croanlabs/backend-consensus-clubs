const assert = require('assert');
const Notification = require('../models/notification');
const GeneralNotification = require('../models/generalNotification');
const PollNotification = require('../models/pollNotification');
const UserNotification = require('../models/userNotification');
const notificationService = require('../services/notification');

describe('services.notification', () => {
  it('General notification process inserts a row into table Notifications', async () => {
    const textNotification = 'test general notification';
    const [
      idNotification,
      idGenNotification,
    ] = await notificationService.notifyAll(textNotification);
    const notification = await Notification.findById(idNotification);
    assert.equal(notification.text, textNotification);
  });

  it('General notification process inserts a row into table GeneralNotifications', async () => {
    const textNotification = 'test general notification';
    const [
      idNotification,
      idGenNotification,
    ] = await notificationService.notifyAll(textNotification);
    const notification = await GeneralNotification.findById(idGenNotification);
    assert.notEqual(notification, null);
  });

  it('Poll notification process inserts a row into table Notifications', async () => {
    const textNotification = 'test poll notification';
    const [
      idNotification,
      idPollNotification,
    ] = await notificationService.notifyPollEvent(textNotification, 0, 0);
    const notification = await Notification.findById(idNotification);
    assert.equal(notification.text, textNotification);
  });

  it('Poll notification process inserts a row into table PollNotifications', async () => {
    const textNotification = 'test poll notification';
    const [
      idNotification,
      idPollNotification,
    ] = await notificationService.notifyPollEvent(textNotification, 1, 1);
    const notification = await PollNotification.findById(idPollNotification);
    assert(
      notification && notification.pollId == 1 && notification.pollId == 1,
    );
  });

  it('User notification process inserts a row into table Notifications', async () => {
    const textNotification = 'test user notification';
    const [
      idNotification,
      idGenNotification,
    ] = await notificationService.notifyUser(textNotification, 0);
    const notification = await Notification.findById(idNotification);
    assert.equal(notification.text, textNotification);
  });

  it('User notification process inserts a row into table UserNotifications', async () => {
    const textNotification = 'test user notification';
    const [
      idNotification,
      idUserNotification,
    ] = await notificationService.notifyUser(textNotification, 0);
    const notification = await UserNotification.findById(idUserNotification);
    assert(notification && notification.userId == 0);
  });
});
