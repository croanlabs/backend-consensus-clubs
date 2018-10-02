const authMiddleware = require('../middleware/auth');
const config = require('../config');
const passport = require('../config/auth').passport;
const request = require('request');

module.exports.set = app => {
  app.get('/', (req, res) => {
    if (req.user) {
      res.send('Hello world!');
    } else {
      res.sendStatus(403);
    }
  });

  app.post('/auth/twitter/reverse', (req, res) => {
    request.post(
      {
        url: 'https://api.twitter.com/oauth/request_token', // TODO Move to configs
        oauth: {
          callback: config.twitterCallbackUrl,
          consumer_key: config.twitterConsumerKey,
          consumer_secret: config.twitterConsumerSecret,
        },
      },
      (err, response, body) => {
        if (err) {
          // TODO logger
          console.log(err);
          return res.sendStatus(500);
        }
        let editedBody = body.replace(/&/g, '", "').replace(/=/g, '": "');
        let jsonStr = `{"${editedBody}"}`;
        res.send(JSON.parse(jsonStr));
      },
    );
  });

  app.post(
    '/auth/twitter',
    (req, res, next) => {
      request.post(
        {
          url: 'https://api.twitter.com/oauth/access_token?oauth_verifier',
          oauth: {
            consumer_key: config.twitterConsumerKey,
            consumer_secret: config.twitterConsumerSecret,
            token: req.query.oauth_token,
          },
          form: {oauth_verifier: req.query.oauth_verifier},
        },
        (error, response, body) => {
          if (error) {
            return res.send(500);
          }
          let editedBody = body.replace(/&/g, '", "').replace(/=/g, '": "');
          let jsonStr = `{"${editedBody}"}`;
          const parsedBody = JSON.parse(jsonStr);
          req.body['oauth_token'] = parsedBody.oauth_token;
          req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
          req.body['user_id'] = parsedBody.user_id;
          next();
        },
      );
    },
    passport.authenticate('twitter-token', {session: false}),
    (req, res, next) => {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }
      req.auth = {
        id: req.user.id,
      };
      return next();
    },
    authMiddleware.generateToken,
    authMiddleware.sendToken,
  );
};
