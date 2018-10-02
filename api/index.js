const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const passport = require('./config/auth').passport;
const controllers = require('./controllers');
const cors = require('cors');
const auth = require('./middleware/auth');

// Create the express application.
const app = express();

// Configure middleware for logging and authentication managing.
app.use(
  cors({
    exposedHeaders: ['x-auth-token'],
    origin: config.siteUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(auth.moveTokenToPassportHeader);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

// Define routes.
controllers.set(app);

// Start listening for incoming connection.
app.listen(8080, () => {
  console.log('app listening on port 8080!');
});
