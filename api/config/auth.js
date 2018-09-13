const TwitterStrategy = require('passport-twitter').Strategy;
const passport = require('passport');
const User = require('../models/user');
const userService = require('../services/user');
const config = require('../config');
const db = require('../config/database');

let exp = (module.exports = {});

// Configure Twitter authentication strategy to be used by Passport.
passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.twitterConsumerKey,
      consumerSecret: config.twitterConsumerSecret,
      callbackURL: config.twitterCallbackUrl,
      passReqToCallback: true,
    },
    (req, token, tokenSecret, profile, done) => {
      userService.findOrCreate(profile.username, profile)
        .then(async (result) => {
          const [user, created] = result;
          if (req.session.ref && created) {
            await userService.newReferral(req.session.ref).catch(err => {
              console.log(err);
              // TODO logger
            })
          }
          if (user) {
            done(null, user);
          } else {
            done('Error creating new user', null);
          }
        }).catch((err) => {
          console.log(err);
          done('Error creating new user', null);
        });
    },
  ),
);

// User serialization/deserialization.
-passport.serializeUser((user, done) => {
  done(null, user.username);
});

-passport.deserializeUser((username, done) => {
  User.findOrCreate({
    where: {username: username},
    defaults: {externalInfo: {}},
  })
    .spread((user, created) => {
      done(null, user);
    })
    .catch(() => console.log('Error deserializing object.'));
});

exp.passport = passport;
