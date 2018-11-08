module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('ReferralNotifications', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      notificationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Notifications',
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

  down: queryInterface => queryInterface.dropTable('ReferralNotifications')
};
