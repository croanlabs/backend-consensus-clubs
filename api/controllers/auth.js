const passport = require('../config/auth').passport;

module.exports.set = function(app) {
  app.get(
    '/',
    (req, res) => {
      if (req.user) {
        res.send('Hello world!');
      } else {
        res.redirect('/login/twitter');
      }
    },
  );

  app.get('/login/twitter', passport.authenticate('twitter'));

  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {failureRedirect: '/login/twitter'}),
    (req, res) => {
      res.redirect('/');
    },
  );
}
