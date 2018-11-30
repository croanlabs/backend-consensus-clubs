const auth = require('../middleware/auth');
const paymentService = require('../services/payment');

module.exports.set = app => {
  app.post('/payment', auth.authenticate, async (req, res) => {
    if (!req.auth) {
      res.status(401).send();
    }
    paymentService
      .payment(req.auth.id, req.body.stripeToken)
      .then(() => {
        res.status(200).send();
      })
      .catch(err => {
        // TODO logger
        res.status(500).json({
          err
        });
      });
  });
};
