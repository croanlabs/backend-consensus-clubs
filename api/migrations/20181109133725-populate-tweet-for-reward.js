module.exports = {
  up: queryInterface => {
    const date = new Date();
    return queryInterface.bulkInsert('TweetsForRewards', [
      {
        id: '1059456655690215426',
        createdAt: date,
        updatedAt: date
      }
    ]);
  },
  down: queryInterface =>
    queryInterface.bulkDelete('TweetsForRewards', null, {})
};
