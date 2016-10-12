'use strict';
var app = angular.module('ponamApp',['ngRoute', 'ngResource', 'ngCookies']).run(function($rootScope, $cookies, $location){
	$rootScope.authenticated = false;
	$rootScope.current_user = "";
	$rootScope.$on( '$locationChangeStart', function(event){
		if(($cookies.get('authenticated') == false || angular.isUndefined($cookies.get('authenticated'))) && ($location.path()!='/' || $location.path()!='/register')){
			$location.path('/');
		}
	});

	$rootScope.$on('$locationChangeSuccess', function(event){
		$rootScope.authenticated = $cookies.get('authenticated');
		$rootScope.current_user = $cookies.get('current_user');
	});
});

app.config(function($routeProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'login.html',
		controller: 'authController'
	})
    //the signup display
    .when('/register', {
    	templateUrl: 'register.html',
    	controller: 'authController'
    })
    //the main display
    .when('/main', {
    	templateUrl: 'main.html',
    	controller: 'mainController'
    });
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});

app.controller('mainController', function($scope, $rootScope, postService, $http, $location, $cookies){
	$scope.posts = postService.query();
	$scope.newPost = {
		created_by: '',
		text: '',
		created_at: ''
	};

	$scope.post = function(){
		$scope.newPost.created_by = $rootScope.current_user;
		$scope.newPost.created_at = Date.now();
		postService.save($scope.newPost, function(){
			$scope.posts = postService.query();
			$scope.newPost = {
				created_by: '',
				text: '',
				created_at: ''
			};
		});
	};

	$scope.logout = function(){
		$http.get('/auth/signout');

		$rootScope.authenticated = false;
		$rootScope.current_user = "";
		$cookies.remove('authenticated');
		$cookies.remove('current_user');
		$location.path('/');
	};
});


app.controller('authController', function($scope, $rootScope, $location, $http, $cookies){
	$scope.user = {username: '', password: ''};
	$scope.retypePassword = '';
	$scope.errorMessage = '';
	$scope.register = function(){
		$http.post('/auth/signup', $scope.user).success(function(data){
			$rootScope.authenticated = true;
			$rootScope.current_user = data.user.username;
			$cookies.put('authenticated', true);
			$cookies.put('current_user', data.user.username);
			//redirect user into main
			$location.path('/main');
		});
	};

	$scope.login = function(){
		$http.post('/auth/login', $scope.user).success(function(data){
			if(data.state == 'success'){
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user.username;
				$cookies.put('authenticated', true);
				$cookies.put('current_user', data.user.username);
				$location.path('/main');
			}
			else{
				$scope.errorMessage = data.message;
			}
		});

	};

});
