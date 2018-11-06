module.exports = (sequelize, DataTypes) => {
  const Reward = sequelize.define(
    'Reward',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id'
        }
      },
      merits: DataTypes.DOUBLE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );
  Reward.associate = models => {
    Reward.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Reward;
};
