const userService = require('../services/user');
const twitterService = require('../services/twitter');
const auth = require('../middleware/auth');

module.exports.set = (app) => {
  app.get('/user', auth.authenticate, async (req, res) => {
    let user;
    try {
      user = await userService.getById(req.auth.id)
    } catch (err) {
      // TODO logger
      console.log(err);
      res.status(500).send();
    }
    res.send(user);
  });

  app.get('/user/opinions', auth.authenticate, async (req, res) => {
    if (!req.auth) {
      res.status(401).send();
    }
    const userOpinions = await userService
      .getUserOpinions(req.auth.id)
      .catch((err) => {
        // TODO logger
        console.log(err);
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
