module.exports = (sequelize, DataTypes) => {
  const UserNotification = sequelize.define(
    'UserNotification',
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
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id',
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  UserNotification.associate = (models) => {
    UserNotification.belongsTo(models.Notification, {
      foreignKey: 'notificationId',
    });
    models.Notification.hasOne(UserNotification, {
      foreignKey: 'notificationId',
    });
  };

  return UserNotification;
};
