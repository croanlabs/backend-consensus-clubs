const notificationService = require('../services/notification');

module.exports.set = app => {
  app.get('/notifications', async (req, res) => {
    // FIXME Use correct user instead of user 0.
    const notifications = await notificationService.getNotifications(0);
    res.send(notifications);
  });
}
