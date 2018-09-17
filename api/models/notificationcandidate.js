module.exports = (sequelize, DataTypes) => {
  var notificationCandidate = sequelize.define(
    'notificationCandidate',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notificationId: DataTypes.INTEGER,
      candidateId: DataTypes.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {},
  );
  notificationCandidate.associate = function(models) {};
  return notificationCandidate;
};
