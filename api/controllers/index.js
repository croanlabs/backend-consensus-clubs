const authController = require('./auth');
const notificationController = require('./notification');
const pollController = require('./poll');
const userController = require('./user');

/**
 * Set routes for all controllers.
 *
 */
module.exports.set = (app) => {
  authController.set(app);
  notificationController.set(app);
  pollController.set(app);
  userController.set(app);
}
