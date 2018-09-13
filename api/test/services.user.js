const assert = require('assert');
const userService = require('../services/user');
const eosService = require('../services/eos');

describe('services.user', () => {
  it('Create user in both blockchain and postgres database', done => {
    userService
      .findOrCreate(`testuser_${+new Date()}`, {
        id: +new Date(),
        displayName: 'Test Consensus Clubs',
      })
      .then(result => {
        const [user, created] = result;
        if (user && created) {
          assert(true, 'User created successfully');
        } else {
          assert(false, 'User was not created');
        }
        done();
      })
      .catch(err => {
        assert(false, err);
        done();
      });
  });

  it('Give rewards to a user that referred a new user', async () => {
    const userBefore = await eosService.getRowById('users', 0);
    await userService.newReferral(0);
    const userAfter = await eosService.getRowById('users', 0);
    assert.equal(
      userAfter['unopinionated_merits'],
      userBefore['unopinionated_merits'] + 500,
    );
  });
});
