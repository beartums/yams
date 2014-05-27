module.exports = {
	'google': {
		'clientId': '902532132509-d141ijv1lpu9jt6b2r54mo1vgm90spua.apps.googleusercontent.com',
		'clientSecret': 'c--feq5IPV7SiPPg2cITjj5q',
		'callbackURL': 'http://localhost:3002/auth/auth/google/callback',
		'scope': ['profile','email']
	},
	
	'facebook' : {
		'clientId' : '830999790247134',
		'clientSecret': '25cd9c06890dad9fbe8390df7ddb9c72',
		'callbackURL': 'http://localhost:3002/auth/facebook/callback',
		'scope': 'email'
	},
	
	'gitHub' : {
		'clientId' : 'e5f37d03bac7f68bab63',
		'clientSecret': 'd9d7a4505a9b07a2851b72c823598acc861bce5f',
		'callbackURL': 'http://localhost:3002/auth/github/callback',
		'scope': ''
	}
	
};