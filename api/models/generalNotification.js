module.exports = (sequelize, DataTypes) => {
  const GeneralNotification = sequelize.define(
    'GeneralNotification',
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
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  GeneralNotification.associate = (models) => {
    GeneralNotification.belongsTo(models.Notification, {
      foreignKey: 'notificationId',
    });
    models.Notification.hasOne(GeneralNotification, {
      as: 'generalNotification',
      foreignKey: 'notificationId',
    });
  };

  return GeneralNotification;
};
