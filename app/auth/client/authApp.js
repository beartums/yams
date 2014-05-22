var app = angular.module('authApp',['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider
	
		.when('/login', {
			templateUrl: './login.html',
			controller: ''
		})
		
		.when('/signup', {
			templateUrl: './signup.html',
			controller: ''
		});
	});
	