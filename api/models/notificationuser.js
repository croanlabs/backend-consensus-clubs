module.exports = (sequelize, DataTypes) => {
  var notificationUser = sequelize.define(
    'notificationUser',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notificationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {},
  );
  notificationUser.associate = function(models) {};
  return notificationUser;
};
