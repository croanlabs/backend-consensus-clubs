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
      pollId: DataTypes.INTEGER,
      candidateId: DataTypes.INTEGER,
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
