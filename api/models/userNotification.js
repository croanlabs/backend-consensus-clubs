const db = require('../config/database');
const Sequelize = require('sequelize');

let UserNotification = db.define(
  'UserNotification',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    notificationId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Notifications',
        referencesKey: 'id',
      },
    },
    userId: Sequelize.INTEGER,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {
    classMethods: {
      associate: models => {
        UserNotification.belongsTo(models.Notification);
        models.Notification.hasOne(UserNotification);
      },
    },
  },
);

module.exports = UserNotification;
