module.exports = {
  up: (queryInterface) => {
    const date = new Date();
    return queryInterface.bulkInsert('ActionTypes', [
      {
        name: 'confidence',
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'opposition',
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'redemption',
        createdAt: date,
        updatedAt: date,
      },
    ])
  },
  down: (queryInterface) => queryInterface.bulkDelete('ActionTypes', null, {}),
};
