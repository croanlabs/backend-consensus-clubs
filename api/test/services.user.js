const assert = require('assert');
const userService = require('../services/user');

describe('services.user', () => {
  it('Create user in both blockchain and postgres database', () => {
    userService.findOrCreate(`testuser_${+ new Date()}`, {
      'id': 123456789,
      'displayName': 'Test Consensus Clubs'
    }).then(() => {
      assert(true, 'User created successfully');
    }).catch((err) => {
      assert(false, err);
    });
  });
});
