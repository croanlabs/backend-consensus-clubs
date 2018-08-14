const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const passport = require('./config/auth').passport;
const controllers = require('./controllers');

// Create the express application.
const app = express();

// Configure middleware for logging and session managing.
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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
controllers.set(app);

// Start listening for incoming connection.
app.listen(8080, () => {
  console.log('app listening on port 8080!');
});
