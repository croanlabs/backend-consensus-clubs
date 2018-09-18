module.exports = (sequelize, DataTypes) => {
  let CandidateNotification = sequelize.define(
    'CandidateNotification',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notificationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Notifications',
          referencesKey: 'id',
        },
      },
      candidateId: DataTypes.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    },
    {},
  );
  CandidateNotification.associate = (models) => {
    CandidateNotification.belongsTo(models.Notification);
  };

  return candidateNotification;
};
