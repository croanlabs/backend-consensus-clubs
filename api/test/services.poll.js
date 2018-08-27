const assert = require('assert');
const pollService = require('../services/poll');
const userService = require('../services/user');
const eosService = require('../services/eos');

describe('services.poll', () => {
  it('Create a poll on the blockchain', done => {
    pollService
      .createPoll('Test question', 'Test description')
      .then(() => {
        assert(true, 'Poll created successfully');
      })
      .catch(err => {
        assert.fail(err);
      })
      .then(() => done());
  });

  it('Get a poll from the blockchain by its id', done => {
    pollService
      .getPoll(0)
      .then(poll => {
        if (
          poll &&
          poll.question == 'Who is the best investor in crypto?' &&
          poll.description == 'Best investor in crypto.'
        ) {
          assert(true, 'Poll was retrieved successfully ');
        } else {
          assert.fail('Wrong poll data was retrieved');
        }
      })
      .catch(err => {
        assert.fail(err);
      })
      .then(() => done());
  });

  it('Get polls from the blockchain', done => {
    pollService
      .getPolls()
      .then(polls => {
        const maxInd = polls.length - 1;
        if (
          polls.length &&
          polls[maxInd].question == 'Test question' &&
          polls[maxInd].description == 'Test description'
        ) {
          assert(true, 'Polls were retrieved successfully');
        } else {
          assert(false, 'No polls were retrieved');
        }
      })
      .catch(err => {
        assert.fail(err);
      })
      .then(() => done());
  });

  it('Create new poll candidate on the blockchain', done => {
    let id = +new Date();
    pollService
      .addCandidate(
        0,
        `Test candidate${id}`,
        'Test candidate description',
        `@test${id}`,
      )
      .then(() => {
        assert(true);
      })
      .catch(err => {
        assert.fail(err);
      })
      .then(() => done());
  });

  it('Create new poll candidate proposed by a user', async () => {
    const resUserBefore = await eosService.getRowById('users', 0);
    const userBefore = resUserBefore.rows[0];
    console.log('userBefore', JSON.stringify(userBefore));
    let id = +new Date();
    await pollService.userAddCandidate(
      0, // User id
      0, // Poll id
      `Test user candidate ${id}`,
      'Test user candidate description',
      `@test_candidate${id}`,
      1, // confidence
      200, // amount of merits
    );
    const resUserAfter = await eosService.getRowById('users', 0);
    const userAfter = resUserAfter.rows[0];
    console.log('userAfter', JSON.stringify(userAfter));
    assert(
      userAfter['unopinionated_merits'] ==
        userBefore['unopinionated_merits'] - 200,
    );
  });
});
