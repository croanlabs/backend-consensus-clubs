module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        username: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        unopinionatedMerits: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        externalInfo: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        lastSeen: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .then(() =>
        queryInterface.addConstraint('Users', ['unopinionatedMerits'], {
          type: 'check',
          where: {
            unopinionatedMerits: {
              [Sequelize.Op.gte]: 0,
            },
          },
        }),
      ),
  down: queryInterface => queryInterface.dropTable('Users'),
};
