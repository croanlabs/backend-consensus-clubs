module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('TweetsForRewards', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT
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

  down: queryInterface => queryInterface.dropTable('TweetsForRewards')
};
