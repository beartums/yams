module.exports = {
	'googleAuth': {
		'clientID': '902532132509-0cd9bps8j3nok4mdpnfsp7vjf8bcag9s.apps.googleusercontent.com',
		'clientSecret': 'iLqaoImmutaBUq8i_3Hb2ZTS',
		'callbackURL': 'http://localhost:3001/auth/google/callback',
		'scope': ['profile','email']
	},
	
	'facebookAuth' : {
		'clientId' : '830999790247134',
		'clientSecret': '25cd9c06890dad9fbe8390df7ddb9c72',
		'callbackURL': 'http://localhost:3001/auth/facebook/callback',
		'scope': 'email'
	},
	
	'githubAuth' : {
		'clientId' : 'e5f37d03bac7f68bab63',
		'clientSecret': 'd9d7a4505a9b07a2851b72c823598acc861bce5f',
		'callbackURL': 'http://localhost:3001/auth/github/callback',
		'scope': ''
	}
	
};