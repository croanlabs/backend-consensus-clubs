const pollService = require('../services/poll');
const auth = require('../middleware/auth');

module.exports.set = app => {
  app.get('/polls', (req, res) => {
    pollService
      .getPolls()
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error getting polls',
        });
      });
  });

  app.get('/polls/:pollId', (req, res) => {
    pollService
      .getPoll(req.params.pollId)
      .then(poll => {
        if (poll) {
          res.send(poll);
        } else {
          res.status(404).send();
        }
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error getting poll',
        });
      });
  });

  app.post('/polls/create', (req, res) => {
    pollService
      .createPoll(req.body.question)
      .then(() => {
        res.status(200).send();
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error creating poll',
        });
      });
  });

  app.post('/polls/:pollId/add-candidate', (req, res) => {
    // TODO enable this endpoint for the admin at some stage.
    res.status(403).send();
    if (!(req.params.pollId && req.body.twitterUser)) {
      res.status(500).send('Error: required parameter not set.');
    }
    pollService
      .addCandidate(
        req.params.pollId,
        req.body.name,
        req.body.description,
        req.body.twitterUser,
        req.body.profilePictureUrl,
      )
      .then(() => {
        res.status(200).send();
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error creating candidate',
        });
      });
  });

  app.post(
    '/polls/:pollId/user-add-candidate',
    auth.authenticate,
    (req, res) => {
      if (!req.auth) {
        res.status(403).send();
      }
      // TODO specify minimum number of merits to stake.
      pollService
        .userAddCandidate(
          req.auth.id,
          req.params.pollId,
          req.body.twitterUser,
          req.body.confidence,
          req.body.amountMerits,
        )
        .then(() => {
          res.status(200).send();
        })
        .catch(err => {
          // TODO logger
          console.log(err);
          res.status(500).json({
            error: 'Error creating candidate',
          });
        });
    },
  );

  app.post(
    '/polls/:pollId/candidates/:candidateId/express-opinion',
    auth.authenticate,
    (req, res) => {
      if (!req.auth) {
        res.status(403).send();
      }
      pollService
        .expressOpinion(
          req.auth.id,
          req.params.candidateId,
          req.body.confidence,
          req.body.commitmentMerits,
        )
        .then(() => {
          res.status(200).send();
        })
        .catch(err => {
          // TODO logger
          console.log(err);
          res.status(500).json({
            error: 'Error creating opinion',
          });
        });
    },
  );

  app.post('/polls/:pollId/candidates/:candidateId/redeem', (req, res) => {
    if (req.body.percentage > 100 || req.body.percentage <= 0) {
      res
        .status(400)
        .send(
          'Error: percentage must be higher than 0 and lower or equal to 100.',
        );
    }
    pollService
      .redeem(
        // FIXME pass user id as first parameter.
        0,
        req.params.candidateId,
        req.body.confidence,
        req.body.percentage,
      )
      .then(() => {
        res.status(200).send();
      })
      .catch(err => {
        // TODO logger
        console.log(err);
        res.status(500).json({
          error: 'Error redeeming benefits',
        });
      });
  });
};
