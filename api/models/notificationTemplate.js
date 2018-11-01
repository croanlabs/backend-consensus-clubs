module.exports = (sequelize, DataTypes) => {
  const NotificationTemplate = sequelize.define(
    'NotificationTemplate',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: DataTypes.STRING,
      text: DataTypes.STRING,
      icon: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );
  return NotificationTemplate;
};
