const db = require('../config/database');
const Sequelize = require('sequelize');

const User = db.define(
  'Notification',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {},
);

module.exports = User;
