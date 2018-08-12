const assert = require('assert');
const userService = require('../services/user');

describe('services.user', () => {
  it('Create user in both blockchain and postgres database', (done) => {
    userService.findOrCreate(`testuser_${+ new Date()}`, {
      'id': + new Date(),
      'displayName': 'Test Consensus Clubs'
    }).then(() => {
      assert(true, 'User created successfully');
      done();
    }).catch((err) => {
      assert(false, err);
      done()
    });
  });
});
