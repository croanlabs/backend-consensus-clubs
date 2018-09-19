module.exports = (sequelize, DataTypes) => {
  let Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  Notification.associate = models => {};

  return Notification;
};
