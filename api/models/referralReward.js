module.exports = (sequelize, DataTypes) => {
  const ReferralReward = sequelize.define(
    'ReferralReward',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rewardId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Reward',
          referencesKey: 'id'
        }
      },
      referredUserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id'
        }
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );

  ReferralReward.associate = models => {
    ReferralReward.belongsTo(models.Reward, {
      foreignKey: 'rewardId'
    });
    models.Reward.hasOne(ReferralReward, {
      as: 'referralReward',
      foreignKey: 'rewardId'
    });
    ReferralReward.belongsTo(models.User, {
      foreignKey: 'referredUserId'
    });
  };
  return ReferralReward;
};
