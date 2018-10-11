module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserNotifications', {
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
    userId: {
      allowNull: false,
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
  }),
  down: (queryInterface) => queryInterface.dropTable('UserNotifications'),
};
