module.exports = (sequelize, DataTypes) => {
  let UserNotification = sequelize.define(
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
      userId: DataTypes.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {},
  );
  UserNotification.associate = models => {
    UserNotification.belongsTo(models.Notification);
  };
  return UserNotification;
};
