const pollService = require('../services/poll');

module.exports.set = (app) => {
  app.get(
    '/polls',
    (req, res) => {
      res.send(pollService.getPolls());
    });

  app.get(
    '/polls/:pollId',
    (req, res) => {
      res.send(pollService.getPoll(req.params.pollId));
    });

  app.post(
    '/polls/create',
    (req, res) => {
      pollService.createPoll(
          req.body.question,
          req.body.description)
        .then(() => {
          res.status(200).send();
        }).catch((err) => {
          res.status(500).json({ error: 'Error creating poll' });
        })
    });
}
