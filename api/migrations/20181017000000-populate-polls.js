const pollService = require('../services/poll');
const {Poll} = require('../config/database');

module.exports = {
  up: async () => {
    await Poll.create({
      question: 'Who are the most insightful crypto investors?',
    });
    await pollService.addCandidate(1, 'melt_dem');
    await pollService.addCandidate(1, 'cburniske');
    await pollService.addCandidate(1, 'aridavidpaul');
    await pollService.addCandidate(1, 'bytesizecapital');

    await Poll.create({
      question: 'What are the best ICOs in 2018?',
    });
    await pollService.addCandidate(2, 'flipnpik');
    await pollService.addCandidate(2, 'Dominium_me');
    await pollService.addCandidate(2, 'ReviewNetworkHQ');
    await pollService.addCandidate(2, 'qravitycom');
    await pollService.addCandidate(2, 'AgateChain');
    await pollService.addCandidate(2, 'FriendUPCloud');
  },
  down: queryInterface =>
    Promise.all([
      queryInterface.bulkDelete('Candidates', null, {}),
      queryInterface.bulkDelete('Polls', null, {}),
    ]),
};
