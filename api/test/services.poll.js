 const assert = require('assert');
 const pollService = require('../services/poll');

describe('services.poll', () => {
  it('Create a poll on the blockchain', (done) => {
    pollService.createPoll(
      'Is the poll creation working?',
      'Tests poll creation.'
    ).then(() => {
      assert(true, 'Poll created successfully');
      done();
    }).catch((err) => {
      assert(false, err);
      done()
    });
  });
});
