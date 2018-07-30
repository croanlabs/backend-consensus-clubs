const auth = require('./auth');

/**
 * Set routes for all controllers.
 *
 */
module.exports.set = (app) => {
  auth.set(app);
}
