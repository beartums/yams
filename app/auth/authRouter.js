/*
	route handler for authorization requests
	
	'/auth' gets us to this router (if that's how it's specified in server.js)
	'/auth/login' is an attempted login.  Post only.
	
	
*/
var path = require('path');
var User = require('./authModels');
var authProviderSecrets = require('./authProviderSecrets');
var express = require('express');
var expressJwt = require('express-jwt');
var jwt = ('jsonwebtoken');
var router = express.Router();
var secret = "this is my jwt secret because i'm so s3cr3tiv3";

var passport = require('passport');
router.use(passport.initialize());
require('./authPassportConfig')(passport);

// HOME PAGE (with login links) ========


	// LOGIN ===============================
	// show the login form
	console.log('authrouter ' + __dirname);
	// Everything from the client subdirectory is served as a static file
	router.use('/client', express.static(__dirname + '/client'));
	
	// Auth intercept is intended as a popup when someone tries to access an unavailable resource
	router.get('/logmein', function(req,res,next) {
		res.sendfile('./app/auth/authIntercept.html');
	});
	
	router.get('', function(req,res,next) {
		console.log('authrouter: /');
		res.redirect('/auth/client/');
	});

	router.route('/login')
		.post(function(req, res, next) {
			passport.authenticate('local-login', function (err, user, info) {
				if (err) { return res.send(err); }
				if (!user) { return res.send(401); }
				res.json({"token":user.createToken()});
			});
		});
	
	router.route('/signup')
		.get(function(req, res) {
			// render the page and pass in any flash data if it exists
			res.render('signup.ejs', { message: req.flash('signupMessage') });
		})
		.post(passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/auth/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));
	
	// connect local credentials to a previously authenticated login --------------------------------
	router.route('/connect/local')
		.get(function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		})
		.post(passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/auth/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));
		
	// LOGOUT ==============================
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/auth/login');
	});
	
	// PROFILE SECTION =====================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	router.get('/profile', isLoggedIn, function(req, res) {
		res.send(req.user);
	});

	// AUTHenticate 
	// Via Google, Facebook, Github
	// Use custom callback functions in passport for better control and to cut down on repetitive code
	router.get('/auth/:net', function(req,res,next) {
		console.log(req.params.net);
		passport.authenticate(req.params.net, {scope : authProviderSecrets[req.params.net].scope}, function(err,user,info) {
			console.log(err);
			if (err) {return next(err);}
			if (!user) {return res.redirect('/auth/login');}
			req.login(user, function(err) {
				if (err) {return next(err);}
				return res.redirect('/woohoodidit');
			});
		})(req,res,next);
	});

	// handle the callback after oauth provider has authenticated the user
	router.get('/auth/:net/callback', function(req, res, next) {
			console.log('callback: ' + req.params.net);
			passport.authenticate(req.params.net, {
				successRedirect : req.session.nextUrl ? req.session.nextUrl : '/',
				failureRedirect : '/profile'
			})(req,res,next);
		});

	// send to requested social media site to do the authentication
	router.get('/connect/:net', function(req,res,next) {
		passport.authorize(req.params.net, { scope : authProviderSecrets[req.params.net].scope });
	});
	
	// handle the callback after requested social media network site has authorized the user
	router.get('/connect/:net/callback', function(req,res,next) {
		passport.authorize(req.params.net, {
			successRedirect : '/profile',
			failureRedirect : '/auth/login'
		});
	});

// UNLINK account
// 
		router.get('/unlink/:network/:id',isLoggedIn,function(req, res) {
			var user = req.user;
			for (var i = 0; i < user.oauthProviders.length; i++) {
				if (req.params.network==user.oauthProviders[i].network &&
						req.params.id == user.oauthProviders[i].id) {
					user.oauthProviders.splice(i,1);
					if (user.oauthProviders.length==0 && !user.local.email) {
						res.redirect('/auth/delete/' + user.id);
					} else {
						user.save(function (err) {
							if (err) throw err;
							res.redirect('/auth/profile');
						});
						break;
					}
				}
			}
		});
			
// DELETE account
		router.get('/delete/:id',isLoggedIn,function(req, res) {
			var user = req.user
			user.remove(function(err) {
				if (err) throw err;
				res.redirect('/auth/logout');
			});
		});

module.exports = router;

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the login page
	res.redirect('/auth/login');
}
