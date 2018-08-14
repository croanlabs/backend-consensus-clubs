 const assert = require('assert');
 const pollService = require('../services/poll');

describe('services.poll', () => {
  it('Create a poll on the blockchain', (done) => {
    pollService.createPoll(
      'Test question',
      'Test description'
    ).then(() => {
      assert(true, 'Poll created successfully');
    }).catch((err) => {
      assert(false, err);
    }).then(() => done());
  });

  it('Get a poll from the blockchain by its id', (done) => {
    pollService.getPoll(0).then((poll) => {
      if (poll && (poll.question == 'Test question') &&
          (poll.description == 'Test description')) {
        assert(true, 'Poll was retrieved successfully ');
      } else {
        assert(false, 'Wrong poll data was retrieved');
      }
    }).catch((err) => {
      assert(false, err);
    }).then(() => done());
  });

  it('Get polls from the blockchain', (done) => {
    pollService.getPolls().then((polls) => {
      if (polls.length && (polls[0].question == 'Test question') &&
          (polls[0].description == 'Test description')) {
        assert(true, 'Polls were retrieved successfully ');
      } else {
        assert(false, 'No polls were retrieved');
      }
    }).catch((err) => {
      assert(false, err);
    }).then(() => done());
  });
});
