module.exports = (sequelize, DataTypes) => {
  const RetweetReward = sequelize.define(
    'RetweetReward',
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
      tweetForRewardId: {
        type: DataTypes.BIGINT,
        references: {
          model: 'TweetForRewards',
          referencesKey: 'id'
        }
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );

  RetweetReward.associate = models => {
    RetweetReward.belongsTo(models.Reward, {
      foreignKey: 'rewardId'
    });
    models.Reward.hasOne(RetweetReward, {
      as: 'retweetReward',
      foreignKey: 'rewardId'
    });
  };
  return RetweetReward;
};
