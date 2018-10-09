module.exports = (sequelize, DataTypes) => {
  let PollNotification = sequelize.define(
    'PollNotification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notificationId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Notifications',
          referencesKey: 'id',
        },
      },
      pollId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Polls',
          referencesKey: 'id',
        },
      },
      candidateId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Candidates',
          referencesKey: 'id',
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  PollNotification.associate = models => {
    PollNotification.belongsTo(models.Notification, {
      foreignKey: 'notificationId',
    });
    models.Notification.hasOne(PollNotification, {
      foreignKey: 'notificationId',
    });
  };

  return PollNotification;
};
