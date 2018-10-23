module.exports = {
  up: queryInterface =>
    queryInterface.addConstraint('TokenHolders', ['userId', 'candidateId'], {
      type: 'unique',
      name: 'TokenHolders_userId_candidateId_unique',
    }),
  down: queryInterface =>
    queryInterface.removeConstraint(
      'TokenHolders',
      'TokenHolders_userId_candidateId_unique',
    ),
};
