'use strict';

define(['myApp'], function(myApp){
    myApp
	    .controller('menuCtrl', ['$route','$scope','$mdSidenav','user', function ($route,$scope,$mdSidenav,user) {
	        $scope.user=user;

	        $scope.action = function(){
	        	user;
	        	$scope.user;
	        };
	    }])
	;	
});
