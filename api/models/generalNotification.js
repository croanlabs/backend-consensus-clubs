const db = require('../config/database');
const Sequelize = require('sequelize');

let GeneralNotification = db.define(
  'GeneralNotification',
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
  },
  {},
);

GeneralNotification.associate = models => {
  GeneralNotification.belongsTo(models.Notification);
};

module.exports = GeneralNotification;
