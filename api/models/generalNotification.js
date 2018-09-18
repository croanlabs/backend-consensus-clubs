module.exports = (sequelize, DataTypes) => {
  const GeneralNotification = sequelize.define(
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
  GeneralNotification.associate = (models) => {
    GeneralNotification.belongsTo(models.Notification);
  };
  return GeneralNotification;
};
