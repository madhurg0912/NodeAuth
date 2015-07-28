var express       = require('express'),
    User          = require('../models/user'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    router        = express.Router();

router
  .get('/', function(req, res, next) {
    res.location('/');
    res.redirect('/');
  })
  
  .get('/about', function(req, res, next) {
    res.render('about', { title: 'About Us' });
  })
  
  .get('/profile', function(req, res, next) {
    res.render('profile', { title: 'Profile' });
  })

  .get('/contact', function(req, res, next) {
    res.render('contact', { title: 'Contact Us' });
  })
  
  .get('/downloads', function(req, res, next) {
    res.render('downloads', { title: 'Downloads' });
  })
  
  .get('/courses', function(req, res, next) {
    res.render('courses', { title: 'Courses' });
  })

  .get('/usertest', function(req, res, next) {
    res.render('usertest', { title: 'OnlineTest' });
  })
  
  .get('/register', function(req, res, next) {
    res.render('register', { title: 'Register' });
  })

  .get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
  })

  .post('/register', function(req, res, next) {
    // get form values
    var name      = req.body.name,
        email     = req.body.email,
        username  = req.body.username,
        password  = req.body.password,
        password2 = req.body.password2;

    // check for image field
    if(req.files.profileimage) {
      console.log('Uploading file...');

      // file info
      var profileImageOriginalName = req.files.profileimage.originalname,
          profileImageName         = req.files.profileimage.name,
          profileImageMime         = req.files.profileimage.mimetype,
          profileImagePath         = req.files.profileimage.path,
          profileImageExtension    = req.files.profileimage.extension,
          profileImageSize         = req.files.profileimage.size;
    } else {
      // set a default image
      var profileImageName = 'noimage.png';
    }

    // form validation
    req.checkBody('name', 'Name field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('email', 'Email format is not valid.').isEmail();
    req.checkBody('username', 'Username field is required.').notEmpty();
    req.checkBody('password', 'Password field is required.').notEmpty();
    req.checkBody('password2', 'Passwords do not match.').equals(password);

    // check for errors
    var errors = req.validationErrors();

    if(errors) {
      res.render('register', {
        errors: errors,
        name: name,
        email: email,
        username: username
      });
    } else {
      var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        profileimage: profileImageName
      });

      // create user
      User.createUser(newUser, function(err, user) {
        if(err) throw err;
        console.log(user);
      });

      // success message
      req.flash('success', 'You are now registered and may login.');

      res.location('/');
      res.redirect('/');
    }
  })

  .post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password.'
  }), function(req, res) {
    console.log('Authentication Successful');
    req.flash('success', 'You are logged in.');
    res.redirect('/');
  })

  .get('/logout', function(req, res) {
    if (req.user) {
      req.logout();
      req.flash('success', 'You have logged out.');
      res.redirect('/users/login');
    } else {
      req.flash('info', 'You need to be logged in to sign out.');
      res.redirect('/users/login');
    }
  });

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if(err) throw err;

      if(!user) {
        console.log('Unknown User');
        return done(null, false, { message: 'Unknown user.' });
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if(err) throw err;

        if(isMatch) {
          return done(null, user);
        } else {
          console.log('Invalid Password');
          return done(null, false, { message: 'Invalid password.' });
        }
      });
    });
  }
));

module.exports = router;
