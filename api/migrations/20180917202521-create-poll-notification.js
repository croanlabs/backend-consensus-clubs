module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PollNotifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      notificationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Notifications',
          referencesKey: 'id',
        },
      },
      pollId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      candidateId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CandidateNotifications');
  },
};
