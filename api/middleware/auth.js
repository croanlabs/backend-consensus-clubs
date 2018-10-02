const config = require('../config');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

let exp = (module.exports = {});

exp.createToken = auth => {
  return jwt.sign(
    {
      id: auth.id,
    },
    config.authTokenSecret,
    {
      expiresIn: 60 * 120,
    },
  );
};

exp.generateToken = (req, res, next) => {
  req.token = exp.createToken(req.auth);
  return next();
};

exp.sendToken = (req, res) => {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

exp.moveTokenToPassportHeader = (req, res, next) => {
  if (!req.headers['x-auth-token'] && req.cookies.token) {
    req.headers['x-auth-token'] = req.cookies.token;
  }
  return next();
};

exp.authenticate = expressJwt({
  secret: config.authTokenSecret,
  requestProperty: 'auth',
  getToken: req => {
    if (req.headers['x-auth-token']) {
      return req.headers['x-auth-token'];
    }
    return null;
  },
});
