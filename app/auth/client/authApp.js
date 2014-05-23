var app = angular.module('authApp',['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider
	
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'loginController'
		})
		
		.when('/signup', {
			templateUrl: 'signup.html',
			controller: 'signupController'
		})
		
		.otherwise({
			redirectTo: 'login'
		});
	});
	