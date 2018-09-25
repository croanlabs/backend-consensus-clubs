onst express = require('express');
onst bodyParser = require('body-parser');
const config = require('./config');
const passport = require('./config/auth').passport;
const controllers = require('./controllers');
const cors = require('cors');

// Create the express application.
const app = express();

// Configure middleware for logging and authentication managing.
app.use(
  cors({
    exposedHeaders: ['x-auth-token'],
  }),
);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

// Define routes.
controllers.set(app);

// Start listening for incoming connection.
app.listen(8080, () => {
  console.log('app listening on port 8080!');
});
