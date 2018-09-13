const passport = require('../config/auth').passport;

module.exports.set = app => {
  app.get('/', (req, res) => {
    if (req.user) {
      res.send('Hello world!');
    } else {
      res.redirect('/login/twitter');
    }
  });

  app.get('/login/twitter', (req, res, next) => {
    if (req.query.ref) {
      req.session.ref = req.query.ref;
    }
    passport.authenticate('twitter')(req, res, next);
  });

  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {failureRedirect: '/login/twitter'}),
    (req, res) => {
      res.redirect('/');
    },
  );
};
