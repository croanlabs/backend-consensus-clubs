module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Candidates', {
    id: {
      allownull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    pollId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Polls',
        referencesKey: 'id',
      },
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    twitterUser: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    profilePictureUrl: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    totalTokensConfidence: {
      allowNull: false,
      type: Sequelize.DOUBLE,
    },
    totalTokensOpposition: {
      allowNull: false,
      type: Sequelize.DOUBLE,
    },
    totalMeritsConfidence: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    totalMeritsOpposition: {
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
  },
  {}),
  down: (queryInterface) => queryInterface.dropTable('Candidates'),
};
