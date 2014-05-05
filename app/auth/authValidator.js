/**
 * authValidator
 *
 * Contains business logic for validating against oauth2 provider logins
 *
 **/
 module.exports = {
	 /**
	 * Validates authentication/authorization from social networks
	 * @param {string} network - name of the authorizing social network (provider)
	 * @param {object} req - the request object, passed from the passport middleware
	 * @param {object} res - the result object
	 * @param {string} token - authorizing token
	 * @param {function} done - callback function indicating the success/failure of this validation
	 * @returns {function} done - callback function (err, user) error not null means failed. user not null means succeeded
	 */
	function validateAuth(network, req, profile, token, done) {
		if (!req.user) { // If the user is not already logged in...
		// try to find the user based on their social media network id
			User.findOne({ 'oauthProviders.id' : profile.id, 'oauthProviders.network': network }, function(err, user) {
				if (err)
						return done(err);

				if (user) {
						// if a user is found, update provider's login details and log them in
						var provider = user.oauthProviders[getProvider(profile.id,network,user)];
						provider.lastLoggedIn = new Date();
						provider.loginCount++;
						user.save(function(err) {
							if (err) throw err;
							return done(null, user);
						});
				} else {
					// if the user isnt in our database, create a new user
					var newUser          = new User();
					// set all of the network information in our user model
					var provider = createProviderObject(network,profile,token);
					provider.lastLoggedIn = new Date();
					provider.loginCount=provider.loginCount?provider.loginCount+1:1;

					// reject any new accounts where the email is anywhere in any other accounts
					User.find({ 'oauthProviders.emails': { $in: provider.emails }}, function (err, users) {
						if (users) 
							return done(null, false, req.flash('authorizeMessage',
							"A user or users already exist in the database with one of your account's verified email addresses"));
					});
					newUser.oauthProviders.push(provider);

					// save the user
					newUser.save(function(err) {
							if (err)
									throw err;
							return done(null, newUser);
					});
				}
				
			});
		} else { // If user is already logged in, we will connect this account to the user account
		
			var user            = req.user; // pull the user out of the session
			User.findOne({'oauthProviders': { $elemMatch: {id: profile.id,network: network}}}, function(err,otherUser) {
				if (otherUser) {
					var msg = otherUser.id==user.id ?
							'That user is already assigned to this account and cannot be assigned multiple times' :
							'That account is already assigned to another user. Unlink it before trying to relink it here.';
					// When another user with the same id is found, reject this join
					// Must be returned as Authenticated (with the original user logged in) but with a flash message
					return done(null,user,req.flash('authorizeMessage', msg));
				} else {
					// Otherwise, add the new account to the list of linked accounts
					var provider = createProviderObject(network,profile,token);
					user.oauthProviders.push(provider);
					user.oauthProviders.sort(function(a,b) { return a.network>b.network ? 1 : -1});

				// save the user
					user.save(function(err) {
						if (err)
								throw err;
						return done(null, user);
					});
				}
			});
		}	
	}
	/**
	 * Searches the provider array and returns the index of the object that matches current authorizing provider or false
	 * @param {string} id - User id
	 * @param {string} network - name of authorizing provider
	 * @param {object} user - currently logged in user object
	 * @returns {number|boolean} index of matched provider, if found, otherwise false
	 **/
	function getProvider(id,network,user) {
		for (var i = 0; i < user.oauthProviders.length; i++) {
			if (user.oauthProviders[i].id==id && user.oauthProviders[i].network==network) return i;
		}
		return false;
	}
	/**
	 * Uses profile information from the authorizing provider to create a provider object for persisting
	 * @param {string} network - name of the authorizing provider
	 * @param {object} profile - the user profile provided by the authorizing provider
	 * @param {string} token - authenticating token provided by the provider
	 * @returns {object} provider object ready to be persisted
	 **/
	 function createProviderObject(network,profile,token) {
		var provider = {};
		
		var emails = [];
		if (profile.emails && profile.emails.length>0) { // Facebook and google support multiple emails
			for (var i = 0; i < profile.emails.length; i++) {
				emails.push(profile.emails[i].value);
			}
		} else if (profile.email) { // GitHub unly supports a single email
			emails[0] == profile.email;
		}
		provider.emails = emails; // facebook can return multiple emails so we'll take the first

		if (network=='google') {
			provider.name  = profile.displayName // look at the passport user profile to see how names are returned
		} else if (network=='facebook') {
			provider.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
		} else if (network == 'github') {
			provider.name = profile.name;
		}
		provider.linked = new Date();
		provider.loginCount = 0;
		provider.id    = profile.id; // set the users facebook id	                
		provider.token = token; // we will save the token that facebook provides to the user	                
		provider.network = network;
		return provider;
	}
}