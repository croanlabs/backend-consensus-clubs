const auth = require('../middleware/auth');
const notificationService = require('../services/notification');

module.exports.set = app => {
  app.get('/notifications', auth.authenticate, async (req, res) => {
    if (!req.auth) {
      res.status(401).send();
    }
    const notifications = await notificationService
      .getNotifications(req.auth.id)
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error getting notifications',
        });
      });
    res.send(notifications);
  });
};
