module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: DataTypes.STRING,
      unopinionatedMerits: DataTypes.DOUBLE,
      externalInfo: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );

  User.associate = models => {
    User.hasMany(models.Opinion, {
      as: 'opinions',
      foreignKey: 'userId'
    });
    User.hasMany(models.TokenHolder, {
      as: 'tokens',
      foreignKey: 'userId'
    });
    User.hasMany(models.Action, {
      as: 'actions',
      foreignKey: 'userId'
    });
    User.hasMany(models.Reward, {
      as: 'rewards',
      foreignKey: 'userId'
    });
  };

  return User;
};
