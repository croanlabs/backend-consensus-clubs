const assert = require('assert');
const eosService = require('../services/eos');
const pollService = require('../services/poll');
const tokenService = require('../services/token');
const userService = require('../services/user');
const utils = require('../utils');

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
          poll.question == 'Who are the most insightful crypto investors?' &&
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

  it('Create new poll candidate proposed by a user and verify that merits are consumed', async () => {
    const userBefore = await eosService.getRowById('users', 0);
    let id = +new Date();
    await pollService.userAddCandidate(
      0, // User id
      0, // Poll id
      `Test user candidate ${id}`,
      'Test user candidate description',
      `@test_candidate${id}`,
      1, // confidence
      20, // amount of merits
    );
    const userAfter = await eosService.getRowById('users', 0);
    assert.equal(
      userAfter['unopinionated_merits'],
        userBefore['unopinionated_merits'] - 20,
    );
  });

  it('User expresses opinion and merits are consumed', async () => {
    const userBefore = await eosService.getRowById('users', 0);
    await pollService.expressOpinion(
      0, // user id
      0, // candidate id
      true, // confidence
      20, // amount of merits
    );
    const userAfter = await eosService.getRowById('users', 0);
    assert.equal(
      userAfter['unopinionated_merits'],
        userBefore['unopinionated_merits'] - 20,
    );
  });

  it('User express opinion and tokens are generated', async () => {
    const candidateBefore = await eosService.getRowById('candidates', 2);
    const tokenAmount = tokenService.meritsToTokens(
      50,
      candidateBefore['total_tokens_confidence'],
    );
    await pollService.expressOpinion(
      0, // user id
      2, // candidate id
      true, // confidence
      50, // amount of merits
    );
    const candidateAfter = await eosService.getRowById('candidates', 2);
    assert.equal(
      Number(candidateAfter['total_tokens_confidence']),
        Number(candidateBefore['total_tokens_confidence']) + tokenAmount,
    );
  });
});
