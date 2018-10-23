module.exports = {
  up: queryInterface =>
    queryInterface.addConstraint('Opinions', ['userId', 'candidateId'], {
      type: 'unique',
      name: 'Opinions_userId_candidateId_unique',
    }),
  down: queryInterface =>
    queryInterface.removeConstraint(
      'Opinions',
      'Opinions_userId_candidateId_unique',
    ),
};
