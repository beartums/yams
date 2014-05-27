app.controller('authController', function($scope) {

});

app.controller('loginController', function($scope, $window, $http) {
	$scope.message=null;
	
	$scope.login = function() {
		$http
	      .post('/auth/login', {email:$scope.email,password:$scope.password})
	      .success(function (data, status, headers, config) {
	        $window.sessionStorage.token = data.token;
	        $scope.message = 'Welcome';
	        $scope.loginSucceeded = true;
	      })
	      .error(function (data, status, headers, config) {
	        // Erase the token if the user fails to log in
	        delete $window.sessionStorage.token;

	        // Handle login errors here
	        $scope.message = 'Error: Invalid user or password';
	        $scope.loginSucceeded = false;
	      });
	}
});

app.controller('signupController', function($scope, $window, $http) {
	$scope.message=null;
	
	$scope.signup = function() {
		$http
	      .post('/auth/signup', 
	    	{
	    	  email:$scope.email,
	    	  password:$scope.password,
	    	  firstName:$scope.firstName,
	    	  lastName:$scope.lastName,
	    	  username:$scope.username
	    	}
	    )
	      .success(function (data, status, headers, config) {
	        $scope.message = data;
	        $scope.signupSucceeded = true;
	      })
	      .error(function (data, status, headers, config) {
	        // Erase the token if the user fails to log in
	        //delete $window.sessionStorage.token;

	        // Handle login errors here
	        $scope.message = data;
	        $scope.signupSucceeded = false;
	      });
	}
});