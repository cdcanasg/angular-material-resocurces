'use strict';

define(['myApp'],function(myApp){
	myApp.config(['$routeProvider','routeResolverProvider',function($routeProvider,routeResolverProvider) {
	    $routeProvider
            .when("/", routeResolverProvider.route.resolve({view: global_app_owner  + '.login.index'}))
	        .when('/' + global_app_owner + '/', routeResolverProvider.route.resolve({view: global_app_owner + '.index'}))
	        .otherwise(routeResolverProvider.route.resolve({view: global_app_owner + '.noAuth'}))
	    ;
	}]);
});
