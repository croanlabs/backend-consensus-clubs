const auth = require('./auth');
const poll = require('./poll');
const notification = require('./notification');

/**
 * Set routes for all controllers.
 *
 */
module.exports.set = (app) => {
  auth.set(app);
  poll.set(app);
  notification.set(app);
}
