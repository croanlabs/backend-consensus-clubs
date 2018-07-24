module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define('User', {
    username: DataTypes.STRING,
    externalInfo: DataTypes.JSON,
  }, {});
  User.associate = (models) => {
    // associations can be defined here
  };
  return User;
};

