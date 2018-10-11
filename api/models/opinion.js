module.exports = (sequelize, DataTypes) => {
  const Opinion = sequelize.define(
    'Opinion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          referencesKey: 'id',
        },
      },
      candidateId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Candidates',
          referencesKey: 'id',
        },
      },
      confidence: DataTypes.BOOLEAN,
      tokenAmount: DataTypes.DOUBLE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  Opinion.associate = (models) => {
    Opinion.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    Opinion.belongsTo(models.Candidate, {
      foreignKey: 'candidateId',
    });
  };

  return Opinion;
};
