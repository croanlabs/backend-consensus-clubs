module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('ReferralRewards', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      rewardId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Rewards',
          referencesKey: 'id'
        }
      },
      referredUserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
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

  down: queryInterface => queryInterface.dropTable('ReferralRewards')
};
