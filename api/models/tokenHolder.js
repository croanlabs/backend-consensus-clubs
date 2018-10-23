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
        references: {
          model: 'Users',
          referencesKey: 'id',
        },
        type: DataTypes.INTEGER,
      },
      candidateId: {
        references: {
          model: 'Candidates',
          referencesKey: 'id',
        },
        type: DataTypes.INTEGER,
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
