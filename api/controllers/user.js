const userService = require('../services/user');

module.exports.set = app => {
  app.get('/user/opinions', async (req, res) => {
    let userOpinions = await userService.getUserOpinions(0)
      .catch(err => {
        // TODO logger
        res.status(500).send();
      });
    res.send(userOpinions);
  });
};
