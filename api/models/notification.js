const db = require('../config/database');
const Sequelize = require('sequelize');

const User = db.define(
  'Notifications',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: Sequelize.STRING,
    externalInfo: Sequelize.JSON,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {},
);

module.exports = User;
