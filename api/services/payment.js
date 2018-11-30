const Stripe = require('stripe');
const config = require('../config');

const stripe = Stripe(config.stripeKey);

const exp = module.exports;

exp.payment = async (userId, stripeToken) => {
  //   const user = await User.findById(userId);
  stripe.charges.create(
    {
      amount: 1000,
      currency: 'usd',
      description: 'Example charge',
      source: stripeToken
    },
    (error, charge, res) => {
      if (error) {
        res.send({
          success: false,
          message: 'error'
        });
      } else {
        res.send({
          success: true,
          message: 'success'
        });
      }
    }
  );
};
