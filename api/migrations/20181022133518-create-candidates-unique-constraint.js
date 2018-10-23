module.exports = {
  up: (queryInterface) =>
    queryInterface.addConstraint('Candidates', ['pollId', 'twitterUser'], {
      type: 'unique',
      name: 'Candidates_pollId_twitterUser_unique',
    }),
  down: queryInterface =>
    queryInterface.removeConstraint(
      'Candidates',
      'Candidates_pollId_twitterUser_unique',
    ),
};
