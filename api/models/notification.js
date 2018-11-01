module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notificationTemplateId: {
        allowNull: true,
        references: {
          model: 'NotificationTemplates',
          referencesKey: 'id',
        },
        type: DataTypes.INTEGER,
      },
      text: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  Notification.associate = models => {
    Notification.belongsTo(models.NotificationTemplate, {
      as: 'notificationTemplate',
      foreignKey: 'notificationTemplateId',
    });
  };

  return Notification;
};
