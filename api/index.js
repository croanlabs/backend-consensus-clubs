const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config');
const controllers = require('./controllers');
const {passport} = require('./config/auth');
const auth = require('./middleware/auth');

// Create the express application
const app = express();

// Set middleware
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

// Define routes
controllers.set(app);

// Sockets server for notifications
const server = http.createServer(app);
const io = socketIo(server);
io.on('connection', (data, accept) => {
  console.log('New client connected');
  console.log(data);
  accept(null, true);
});

// Start listening for incoming connections
server.listen(8080, () => {
  console.log('app listening on port 8080!');
});
