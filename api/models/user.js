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

  User.associate = (models) => {
    User.hasMany(models.Opinion, {
      as: 'opinions',
    });
    User.hasMany(models.TokenHolder, {
      as: 'tokens',
    });
    User.hasMany(models.Action, {
      as: 'actions',
    })
  };

  return User;
}
