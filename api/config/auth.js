const db = require('../config/database');
const config = require('../config');
const passport = require('passport');
const User = require('../models/user');
const userService = require('../services/user');
const TwitterTokenStrategy = require('passport-twitter-token');

let exp = (module.exports = {});

// Configure Twitter authentication strategy to be used by Passport.
passport.use(
  new TwitterTokenStrategy(
    {
      consumerKey: config.twitterConsumerKey,
      consumerSecret: config.twitterConsumerSecret,
      includeEmail: true,
      passReqToCallback: true,
    },
    (req, token, tokenSecret, profile, done) => {
      userService
        .findOrCreate(profile.username, profile)
        .then(async result => {
          const [user, created] = result;
          // FIXME referrals. We are not using session anymore.
          //if (req.session.ref && created) {
          //  await userService.newReferral(req.session.ref).catch(err => {
          //    console.log(err);
          //    // TODO logger
          //  })
          //}
          if (user) {
            done(null, user);
          } else {
            done('Error creating new user', null);
          }
        })
        .catch(err => {
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
