var express = require('express');
    router  = express.Router();

router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Home' });
});

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  req.flash('info', 'You need to be logged in to view that page.');
  res.redirect('/users/login');
}

module.exports = router;
