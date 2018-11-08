module.exports = (sequelize, DataTypes) => {
  const ReferralNotification = sequelize.define(
    'ReferralNotification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      notificationId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Notifications',
          referencesKey: 'id'
        }
      },
      referredUserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id'
        }
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );

  ReferralNotification.associate = models => {
    ReferralNotification.belongsTo(models.Notification, {
      foreignKey: 'notificationId'
    });
    models.Notification.hasOne(ReferralNotification, {
      as: 'referralNotification',
      foreignKey: 'notificationId'
    });
  };

  return ReferralNotification;
};
