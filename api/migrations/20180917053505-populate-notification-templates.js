module.exports = {
  up: queryInterface => {
    const date = new Date();
    queryInterface.bulkInsert('NotificationTemplates', [
      {
        code: 'welcome',
        text: 'Welcome to Consensus Clubs!',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'new_poll',
        text: 'New poll',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'new_candidate',
        text: 'New candidate',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'time_to_vote',
        text: 'Time to vote',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'successful_consensus',
        text: 'Congrats! Successful consensus!',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'weak_consensus',
        text: 'Oops! Weak consensus',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'referral_success',
        text: 'Referral success',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'retweet_bonus',
        text: 'Retweet bonus',
        createdAt: date,
        updatedAt: date,
      },
      {
        code: 'direct_message_bonus',
        text: 'Direct message bonus',
        createdAt: date,
        updatedAt: date,
      },
    ]);
  },
  down: queryInterface =>
    queryInterface.bulkDelete('NotificationTemplates', null, {}),
};
