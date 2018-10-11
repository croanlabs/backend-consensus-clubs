module.exports = (sequelize, DataTypes) => {
  const TokenHolder = sequelize.define(
    'TokenHolder',
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

  TokenHolder.associate = (models) => {
    TokenHolder.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    TokenHolder.belongsTo(models.Candidate, {
      foreignKey: 'candidateId',
    });
  };

  return TokenHolder;
};
