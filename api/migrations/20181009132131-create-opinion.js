module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(
    'Opinions',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id',
        },
      },
      candidateId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Candidates',
          referencesKey: 'id',
        },
      },
      confidence: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      merits: {
        allowNull: false,
        type: Sequelize.DOUBLE,
      },
      tokenAmount: {
        allowNull: false,
        type: Sequelize.DOUBLE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    },
    {},
  ),
  down: (queryInterface) => queryInterface.dropTable('Opinions'),
};
