const assert = require('assert');
const rewardService = require('../services/reward');
const { User, Reward, ReferralReward } = require('../config/database');

describe('services.reward', async () => {
  // ReferralReward: if the user has received 500 merits
  it('User receives referral and 500 merits are added', async () => {
    const time = +new Date();
    // user who receives reward
    const userBefore = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
      lastSeen: new Date()
    });
    // user who has joined
    const referredUser = await User.create({
      username: `referredUser${time}`,
      unopinionatedMerits: 1000,
      externalInfo: '',
      lastSeen: new Date()
    });
    await rewardService.referralReward(
      userBefore.id, // user id
      referredUser.id // referred user id
    );
    const userAfter = await User.findById(userBefore.id);
    assert.equal(
      userAfter.unopinionatedMerits,
      userBefore.unopinionatedMerits + 500
    );
    await ReferralReward.destroy({ where: {} });
    await Reward.destroy({ where: {} });
    await userAfter.destroy();
    await referredUser.destroy();
  });

  // ReferralReward: a new row in both Reward table and ReferralReward table
  it('User receives referral and 500 merits are added', async () => {
    const time = +new Date();
    // user who receives reward
    const user = await User.create({
      username: `user${time}`,
      unopinionatedMerits: 100,
      externalInfo: '',
      lastSeen: new Date()
    });
    // user who has joined
    const referredUser = await User.create({
      username: `referredUser${time}`,
      unopinionatedMerits: 1000,
      externalInfo: '',
      lastSeen: new Date()
    });
    await rewardService.referralReward(
      user.id, // user id
      referredUser.id // referred user id
    );
    const rewards = await Reward.findAll({
      where: { userId: user.id },
      include: {
        as: 'referralReward',
        model: ReferralReward,
        required: true
      }
    });
    assert(
      rewards.length === 1 &&
        rewards[0].referralReward.referredUserId === referredUser.id
    );
    await ReferralReward.destroy({ where: {} });
    await Reward.destroy({ where: {} });
    await user.destroy();
    await referredUser.destroy();
  });
});
