const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('./config');

// Configure Twitter authentication strategy to be used by Passport.
passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.twitterConsumerKey,
      consumerSecret: config.twitterConsumerSecret,
      callbackURL: config.twitterCallbackUrl,
    },
    (token, tokenSecret, profile, done) => {
      console.log(`User connected! \n
        Token: ${token} \n
        Token Secret: ${tokenSecret}
        Profile: ${JSON.stringify(profile)}`);

      // FIXME return the actual user and not its Twitter profile.
      done(null, profile);
    },
  ),
);

// User serialization/deserialization.
//
// FIXME Serialize should retrieve the local user ID and deserialize
// should get and retrieve the actual user object from the its ID.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Create the express application.
const app = express();

// Configure middleware for logging and session managing.
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: config.sessionSecret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  // TODO this function to verify user and eventually roles as well
  // should be defined separately.
  (req, res) => {
    if (req.user) {
      res.send('Hello world!');
    } else {
      res.redirect('/login/twitter');
    }
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login/twitter' }),
  (req, res) => {
    res.redirect('/');
  });

// Start listening for incoming connection.
app.listen(8080, () => {
  console.log('app listening on port 8080!');
});
