const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');
const config = require('../config');
const User = require('../models/user');
const userService = require('../services/user');

module.exports = {};
const exp = module.exports;

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
      console.log(profile);
      userService
        .findOrCreate(profile.username, profile)
        .then(async (result) => {
          const user = result[0];
          // FIXME referrals. We are not using session anymore.
          // if (req.session.ref && created) {
          //  await userService.newReferral(req.session.ref).catch(err => {
          //    console.log(err);
          //    // TODO logger
          //  })
          // }
          if (user) {
            const userDes = {
              id: user.id,
              username: user.username,
              name: user.externalInfo.displayName,
              profileImageUrl: user.externalInfo.photos[0].value,
            };
            done(null, userDes);
          } else {
            done('Error creating new user', null);
          }
        })
        .catch((err) => {
          console.log(err);
          done('Error creating new user', null);
        });
    },
  ),
);

// User serialization/deserialization.
passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  User.findOrCreate({
    where: { username },
    defaults: { externalInfo: {} },
  })
    .spread((user) => {
      const userDes = {
        id: user.id,
        username: user.username,
        name: user.externalInfo.displayName,
        profileImageUrl: user.externalInfo.photos[0].value,
      };
      done(null, userDes);
    })
    .catch(() => console.log('Error deserializing object.'));
});

exp.passport = passport;
