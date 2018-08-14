const auth = require('./auth');
const poll = require('./poll');

/**
 * Set routes for all controllers.
 *
 */
module.exports.set = (app) => {
  auth.set(app);
  poll.set(app);
}
