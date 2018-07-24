const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const passport = require('./config/auth').passport;

// Create the express application.
const app = express();

// Configure middleware for logging and session managing.
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(
  session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get(
  '/',
  // TODO this function to verify user and eventually roles as well.
  // It should be defined separately.
  (req, res) => {
    if (req.user) {
      res.send('Hello world!');
    } else {
      res.redirect('/login/twitter');
    }
  },
);

app.get('/login/twitter', passport.authenticate('twitter'));

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/login/twitter'}),
  (req, res) => {
    res.redirect('/');
  },
);

// Start listening for incoming connection.
app.listen(8080, () => {
  console.log('app listening on port 8080!');
});
