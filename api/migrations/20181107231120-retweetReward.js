module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('RetweetRewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      rewardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Rewards',
          referencesKey: 'id'
        }
      },
      tweetForRewardId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TweetsForRewards',
          referencesKey: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),

  down: queryInterface => queryInterface.dropTable('RetweetRewards')
};
