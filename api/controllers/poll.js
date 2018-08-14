const pollService = require('../services/poll');

module.exports.set = (app) => {
  app.get(
    '/polls',
    (req, res) => {
      pollService.getPolls()
        .then((result) => {
          res.send(result);
        }).catch((err) => {
          // TODO logger
          console.log(err);
          res.status(500).json({
            error: 'Error getting polls',
          })
        });
    });

  app.get(
    '/polls/:pollId',
    (req, res) => {
      pollService.getPoll(req.params.pollId)
        .then((poll) => {
          if (poll) {
            res.send(poll);
          } else {
            res.status(404).send();
          }
        }).catch((err) => {
          // TODO logger
          console.log(err);
          res.status(500).json({
            error: 'Error getting poll',
          })
        })
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
          // TODO log
          res.status(500).json({
            error: 'Error creating poll',
          });
        })
    });
}
