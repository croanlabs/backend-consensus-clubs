const db = require('../config/database');
const Sequelize = require('sequelize');

let Notification = db.define(
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
  {
    classMethods: {
      associate: models => {
        models.GeneralNotification.belongsTo(this);
        this.hasOne(models.GeneralNotification);

        models.UserNotification.belongsTo(this);
        this.hasOne(models.UserNotification);
      },
    },
  },
);

module.exports = Notification;
