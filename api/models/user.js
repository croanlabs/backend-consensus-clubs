const db = require('../config/database');
const Sequelize = require('sequelize');

const User = db.define(
  'User',
  {
    username: Sequelize.STRING,
    externalInfo: Sequelize.JSON,
  },
  {},
);

module.exports = User;
