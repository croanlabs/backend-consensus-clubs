module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('GeneralNotifications', {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('GeneralNotifications'),
};
