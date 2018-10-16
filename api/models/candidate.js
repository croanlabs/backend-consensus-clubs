module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define(
    'Candidate',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pollId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Polls',
          referencesKey: 'id',
        },
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      twitterUser: DataTypes.STRING,
      profilePictureUrl: DataTypes.STRING,
      totalTokensConfidence: DataTypes.DOUBLE,
      totalTokensOpposition: DataTypes.DOUBLE,
      totalMeritsConfidence: DataTypes.INTEGER,
      totalMeritsOpposition: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  Candidate.associate = (models) => {
    Candidate.belongsTo(models.Poll, {
      foreignKey: 'pollId',
    });
    Candidate.hasMany(models.Opinion, {
      as: 'opinions',
      foreignKey: 'candidateId',
    });
  };

  return Candidate;
};
