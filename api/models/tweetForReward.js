module.exports = (sequelize, DataTypes) => {
  const TweetForReward = sequelize.define(
    'TweetForReward',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {}
  );

  TweetForReward.associate = models => {
    models.RetweetReward.belongsTo(TweetForReward, {
      foreignKey: 'tweetForRewardId'
    });
    TweetForReward.hasMany(models.RetweetReward, {
      as: 'retweetRewards',
      foreignKey: 'tweetForRewardId'
    });
  };

  return TweetForReward;
};
