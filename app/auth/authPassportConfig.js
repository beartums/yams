/**
	* Configure Passport Strategies
	**/
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
// load up the user model
var User       = require('./authModels');
var authProviderSecrets = require('./authProviderSecrets');
var authValidator = require('./authValidator');
// expose this function to our app using module.exports
module.exports = function(passport) {

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

			// if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
						user.lastLogin = new Date();
						user.loginCount ++;
						user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
        });

    }));

    // LOCAL SIGNUP ============================================================
  // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
								newUser.local.created	 = new Date();
								newUser.local.loginCount = 1;
								newUser.local.lastLogin = new Date();

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });    
      });
    }));
		
		// LOCAL LOGIN =============================================================
    // we are using named strategies since we have one for login and one for signup
		// by default, if there was no name, it would just be called 'local'

    	
	// FACEBOOK ================================================================
    passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
        clientID        : authProviderSecrets.facebook.clientId,
        clientSecret    : authProviderSecrets.facebook.clientSecret,
        callbackURL     : authProviderSecrets.facebook.callbackURL,
				passReqToCallback: true // allows us to test for lagged in user

    },
    function(req, token, refreshToken, profile, done) {

		// asynchronous
			process.nextTick(function() {
				return authValidator.validateAuth('facebook',req,profile,token,done);
			});

    }));
		
		/**
		* GOOGLE Strategy
		*/
		passport.use(new GoogleStrategy({

        clientID        : authProviderSecrets.google.clientId,
        clientSecret    : authProviderSecrets.google.clientSecret,
        callbackURL     : authProviderSecrets.google.callbackURL,
				passReqToCallback: true

    },
    function(req, token, refreshToken, profile, done) {

		// make the code asynchronous
		// User.findOne won't fire until we have all our data back from Google
			process.nextTick(function() {
				console.log('in-callback: google');
				return authValidator.validateAuth('google',req,profile,token,done);
			}

		);

  }));

		/**
		* GITHUB Strategy
		*/
		passport.use(new GitHubStrategy({

        clientID        : authProviderSecrets.gitHub.clientId,
        clientSecret    : authProviderSecrets.gitHub.clientSecret,
        callbackURL     : authProviderSecrets.gitHub.callbackURL,
				passReqToCallback: true

    },
    function(req, token, refreshToken, profile, done) {

		// make the code asynchronous
		// User.findOne won't fire until we have all our data back from Google
			process.nextTick(function() {
				return authValidator.validateAuth('github',req,profile,token,done);
			}

		);

  }));
	
};



