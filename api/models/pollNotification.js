const db = require('../config/database');
const Sequelize = require('sequelize');

let PollNotification = db.define(
  'PollNotification',
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
    pollId: Sequelize.INTEGER,
    candidateId: Sequelize.INTEGER,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  },
  {},
);

PollNotification.associate = models => {
  PollNotification.belongsTo(models.Notification);
};

module.exports = PollNotification;
