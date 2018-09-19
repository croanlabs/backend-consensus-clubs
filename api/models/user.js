module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: DataTypes.STRING,
      externalInfo: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );
  return User;
}
