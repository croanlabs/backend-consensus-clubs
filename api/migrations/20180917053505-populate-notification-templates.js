module.exports = {
  up: queryInterface => {
    const date = new Date();
    queryInterface.bulkInsert('NotificationTemplates', [
      {
        code: 'welcome',
        text: 'Welcome to Consensus Clubs!',
        icon: 'bonusIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'new_poll',
        text: 'New poll',
        icon: 'newIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'new_candidate',
        text: 'New candidate',
        icon: 'newIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'time_to_vote',
        text: 'Time to vote',
        icon: 'voteIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'successful_consensus',
        text: 'Congrats! Successful consensus!',
        icon: 'successIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'weak_consensus',
        text: 'Oops! Weak consensus',
        icon: 'thumbsDownIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'referral_success',
        text: 'Referral success',
        icon: 'bonusIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'retweet_bonus',
        text: 'Retweet bonus',
        icon: 'bonusIcon',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'direct_message_bonus',
        text: 'Direct message bonus',
        icon: 'bonusIcon',
        createdAt: date,
        updatedAt: date,
      },
    ]);
  },
  down: queryInterface =>
    queryInterface.bulkDelete('NotificationTemplates', null, {}),
};
