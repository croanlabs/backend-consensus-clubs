const userService = require('../services/user');
const twitterService = require('../services/twitter');
const auth = require('../middleware/auth');

module.exports.set = app => {
  app.get('/user/opinions', auth.authenticate, async (req, res) => {
    if (!req.auth) {
      res.status(403).send();
    }
    let userOpinions = await userService
      .getUserOpinions(req.auth.id)
      .catch(err => {
        // TODO logger
        res.status(500).send();
      });
    res.send(userOpinions);
  });

  // TODO req.auth
  app.get('/twitter-user-search', async (req, res) => {
    if (!req.query.q) {
      res.status(400);
    }
    const usersRes = await twitterService.searchTwitterUsers(req.query.q);
    res.send(usersRes.data);
  });
};
