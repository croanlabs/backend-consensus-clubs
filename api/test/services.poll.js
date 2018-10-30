const assert = require('assert');
const pollService = require('../services/poll');
const tokenService = require('../services/token');
const {
  Action,
  Candidate,
  Opinion,
  Poll,
  TokenHolder,
  User,
  sequelize,
} = require('../config/database');

describe('services.poll', async () => {
  it('Create a poll', async () => {
    const time = +new Date();
    const {dataValues: poll} = await pollService
      .createPoll(`Test question ${time}`)
      .catch(err => {
        assert.fail(err);
      });
    await Poll.destroy({where: {id: poll.id}});
    assert(true);
  });

  it('Get a poll by its id', async () => {
    const poll = await pollService.getPoll(1);
    if (
      poll &&
      poll.question === 'Who are the most insightful crypto investors?'
    ) {
      assert(true);
    } else {
      assert.fail('Wrong poll data was retrieved');
    }
  });

  it('Get all polls', async () => {
    await pollService.createPoll('Test question');
    const polls = await pollService.getPolls();
    const poll = polls.slice(-1)[0];
    if (poll.question === 'Test question') {
      assert(true, 'Polls were retrieved successfully');
    } else {
      assert(false);
    }
  });

  it('Create new poll candidate', async () => {
    const candidate = await pollService.addCandidate(1, 'consensusclubs');
    if (
      candidate.id &&
      candidate.pollId === 1 &&
      candidate.netTokenAmount === 0 &&
      candidate.totalTokensConfidence === 0 &&
      candidate.totalTokensOpposition === 0 &&
      candidate.totalMeritsConfidence === 0 &&
      candidate.totalMeritsOpposition === 0
    ) {
      assert(true);
    } else {
      assert(false);
    }
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    await TokenHolder.destroy({where: {}});
    await candidate.destroy();
  });

  it('Create new poll candidate proposed by a user and verify that merits are consumed', async () => {
    const time = +new Date();
    const {dataValues: userBefore} = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    const candidate = await pollService.userAddCandidate(
      userBefore.id, // User id
      1, // Poll id
      'consensusclubs',
      true, // confidence
      20, // number of merits
    );
    const userAfter = await User.findById(userBefore.id);
    assert.equal(
      userAfter.unopinionatedMerits,
      userBefore.unopinionatedMerits - 20,
    );
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    await TokenHolder.destroy({where: {}});
    await candidate.destroy();
  });

  it('User expresses opinion and merits are consumed', async () => {
    const time = +new Date();
    const {dataValues: userBefore} = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    await pollService.expressOpinion(
      userBefore.id, // user id
      1, // candidate id
      true, // confidence
      20, // number of merits
    );
    const userAfter = await User.findById(userBefore.id);
    assert.equal(
      userAfter.unopinionatedMerits,
      userBefore.unopinionatedMerits - 20,
    );
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    await TokenHolder.destroy({where: {}});
    await userAfter.destroy();
  });

  it('User expresses opinion and tokens are generated', async () => {
    const time = +new Date();
    const candidateBefore = await Candidate.findById(2);
    const user = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    const tokenAmount = tokenService.meritsToTokensBuy(
      50,
      candidateBefore.totalTokensConfidence,
    );
    await pollService.expressOpinion(
      user.dataValues.id, // user id
      2, // candidate id
      true, // confidence
      50, // number of merits
    );
    const candidateAfter = await Candidate.findById(2);
    assert.equal(
      candidateAfter.totalTokensConfidence.toFixed(4),
      (candidateBefore.totalTokensConfidence + tokenAmount).toFixed(4),
    );
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    await TokenHolder.destroy({where: {}});
    await user.destroy();
  });

  it('User emits an opinion and then redeems it. Unopinionated merits should remain the same', async () => {
    const time = +new Date();
    const {dataValues: userBefore} = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    await pollService.expressOpinion(
      userBefore.id, // user id
      1, // candidate id
      true, // confidence
      75, // number of merits
    );
    await pollService.withdraw(
      userBefore.id, // user id
      1, // candidate id
      true, // confidence
    );
    const userAfter = await User.findById(userBefore.id);
    assert.equal(userAfter.unopinionatedMerits.toFixed(5), userBefore.unopinionatedMerits.toFixed(5));
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    await userAfter.destroy();
  });

  it('User emits an opinion and then redeems it. Candidate tokens should remain the same', async () => {
    const time = +new Date();
    const user = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    const candidateBefore = await Candidate.findById(3);
    await pollService.expressOpinion(
      user.dataValues.id, // user id
      3, // candidate id
      false, // confidence
      20, // number of merits
    );
    await pollService.withdraw(
      user.dataValues.id, // user id
      3, // candidate id
      false, // confidence
    );
    const candidateAfter = await Candidate.findById(3);
    assert(
      candidateAfter.totalTokensOpposition ===
        candidateBefore.totalTokensOpposition &&
        candidateAfter.totalTokensConfidence ===
          candidateBefore.totalTokensConfidence &&
        candidateAfter.totalMeritsConfidence ===
          candidateBefore.totalTokensConfidence &&
        candidateAfter.totalMeritsOpposition ===
          candidateBefore.totalTokensOpposition,
    );
    await Action.destroy({where: {}});
    await Opinion.destroy({where: {}});
    user.destroy();
  });

  it('User emits an opinion and then redeems 50% of it. Unopinionated merits should be updated', async () => {
    const time = new Date();
    const {dataValues: userBefore} = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
    });
    const candidate = await Candidate.create({
      pollId: 2,
      name: 'test',
      description: 'test',
      twitterUser: `test${time}`,
      profilePictureUrl: 'test',
      netTokenAmount: 0,
      totalTokensConfidence: 0,
      totalTokensOpposition: 0,
      totalMeritsConfidence: 0,
      totalMeritsOpposition: 0,
    });
    await pollService.expressOpinion(
      userBefore.id, // user id
      candidate.id, // candidate id
      false, // confidence
      20, // number of merits
    );
    const transaction = await sequelize.transaction();
    await pollService.redeemFromPercentage(
      userBefore.id, // user id
      candidate.id, // candidate id
      false, // confidence
      50, // percentage
      transaction,
    );
    await transaction.commit();
    const userAfter = await User.findById(userBefore.id);

    // Because of the bounding curve, when you sell half of your tokens
    // you don't get half of the merits you used to buy those tokens as
    // the last tokens you buy are more expensive. In this case you get
    // 3/4 of the original opinion.
    assert.equal(
      userAfter.unopinionatedMerits,
      userBefore.unopinionatedMerits - 5,
    );
  });
});
