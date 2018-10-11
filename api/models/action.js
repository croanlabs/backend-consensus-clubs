module.exports = (sequelize, DataTypes) => {
  const Action = sequelize.define(
    'Action',
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
      actionTypeId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'ActionTypes',
          referencesKey: 'id',
        },
      },
      merits: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );
  Action.associate = (models) => {
    Action.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    Action.belongsTo(models.Candidate, {
      foreignKey: 'candidateId',
    });
    Action.belongsTo(models.ActionType, {
      foreignKey: 'actionTypeId',
    });
  };
  return Action;
};
