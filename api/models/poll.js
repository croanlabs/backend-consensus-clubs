module.exports = (sequelize, DataTypes) => {
  const Poll = sequelize.define(
    'Poll',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  Poll.associate = (models) => {
    Poll.hasMany(models.Candidate, {
      as: 'candidates',
      foreignKey: 'pollId',
    });
  };

  return Poll;
};
