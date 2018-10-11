module.exports = (sequelize, DataTypes) => {
  const ActionType = sequelize.define(
    'ActionType',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );
  return ActionType;
};
