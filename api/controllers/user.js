const userService = require('../services/user');
const twitterService = require('../services/twitter');
const auth = require('../middleware/auth');

module.exports.set = app => {
  app.get('/user', auth.authenticate, async (req, res) => {
    let user;
    try {
      user = await userService.getById(req.auth.id);
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
      .catch(err => {
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

  // Retweet to get reward
  app.post('/twitter-retweet', auth.authenticate, (req, res) => {
    if (!req.auth) {
      res.status(401).send();
    }
    if (!req.query.id) {
      res.status(400);
    }
    twitterService
      .retweetReward(req.auth.id, req.body.tweetId)
      .then(() => {
        res.status(200).send();
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error retweeting'
        });
      });
  });

  // pass if user has rewarded or not
  // app.get('/confirm-reward', async (req, res) => {
  // })
};
