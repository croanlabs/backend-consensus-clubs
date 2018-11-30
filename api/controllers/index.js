const authController = require('./auth');
const notificationController = require('./notification');
const paymentController = require('./payment');
const pollController = require('./poll');
const userController = require('./user');

/**
 * Set routes for all controllers.
 *
 */
module.exports.set = app => {
  authController.set(app);
  notificationController.set(app);
  paymentController.set(app);
  pollController.set(app);
  userController.set(app);
};
