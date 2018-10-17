module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('ActionTypes', [
    {
      name: 'confidence',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'opposition',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'redemption',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('ActionTypes', null, {}),
};
