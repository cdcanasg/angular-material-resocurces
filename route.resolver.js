'use strict';

define([], function () {

    var routeResolver = function () {

        this.$get = function () {
            return this;
        };

        this.routeConfig = function () {
            var htmlDirectory = '/app/html/',
                controllersDirectory = '/app/controllers/',

            setBaseDirectories = function (config) {
                htmlDirectory = config.htmlDir;
                controllersDirectory = config.controllersDir;
            },

            getHtmlDirectory = function () {
                return htmlDirectory;
            },

            getControllersDirectory = function () {
                return controllersDirectory;
            };

            return {
                setBaseDirectories: setBaseDirectories,
                getControllersDirectory: getControllersDirectory,
                getHtmlDirectory: getHtmlDirectory
            };
        }();

        this.route = function (routeConfig) {

            var resolve = function (config) {
                var controllerSource = Object.keys(config)[0], 
                htmlPath = routeConfig.getHtmlDirectory() + controllerSource + 's/',
                controllerPath = routeConfig.getControllersDirectory() + controllerSource + 's/',
                routeArray = config[controllerSource].split('.'),
                complementPath = '';
                 
                for (var key in routeArray){
                    if(key!=0){
                        var sufix = routeArray.length - 1 == key ? '' : '/';
                    complementPath = complementPath + routeArray[key].toLowerCase() + sufix;    
                    }
                    
                };
                htmlPath = htmlPath + complementPath + '.html';
                controllerPath = controllerPath + complementPath + '.js';

                htmlPath = htmlPath.replace("{app_owner}",routeArray[0]);
                controllerPath = controllerPath.replace("{app_owner}",routeArray[0]);
                var routeDef = {};
                routeDef.templateUrl = htmlPath;
                routeDef.controller = config[controllerSource] + '.' + controllerSource;
                routeDef.resolve = {
                    load: ['$q', '$rootScope', function ($q, $rootScope) {
                        return resolveDependencies($q, $rootScope, [controllerPath]);
                    }]
                };

                return routeDef;
            },

            resolveDependencies = function ($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function () {
                    defer.resolve();
                    $rootScope.$apply()
                });

                return defer.promise;
            };

            return {
                resolve: resolve
            }
        }(this.routeConfig);

    };

    var servicesApp = angular.module('routeResolverServices', []);

    //Must be a provider since it will be injected into module.config()    
    servicesApp.provider('routeResolver', routeResolver);
});
