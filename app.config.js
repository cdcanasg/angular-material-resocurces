'use strict';

define(['myApp'], function(myApp){
    myApp
        .config(
            function($mdThemingProvider) {
                $mdThemingProvider.theme('default').primaryPalette('blue').accentPalette('orange');
                $mdThemingProvider.theme('dark-grey').primaryPalette('grey').accentPalette('grey').backgroundPalette('grey').dark();
                $mdThemingProvider.theme('dark-orange').primaryPalette('orange').accentPalette('orange').backgroundPalette('orange').dark();
                $mdThemingProvider.theme('orange').primaryPalette('orange').accentPalette('blue');
                $mdThemingProvider.theme('dark-purple').primaryPalette('deep-purple').accentPalette('deep-purple').backgroundPalette('deep-purple').dark();
                $mdThemingProvider.theme('dark-blue').primaryPalette('blue').accentPalette('blue').backgroundPalette('blue').dark();
                $mdThemingProvider.theme('dark-blue-grey').primaryPalette('blue-grey').accentPalette('blue-grey').backgroundPalette('blue-grey').dark();
                $mdThemingProvider.theme('dark-cyan').primaryPalette('cyan').accentPalette('cyan').backgroundPalette('cyan').dark();
                $mdThemingProvider.theme('dark-teal').primaryPalette('teal').accentPalette('teal').backgroundPalette('teal').dark();
                $mdThemingProvider.theme('teal').primaryPalette('teal').accentPalette('teal').backgroundPalette('blue-grey');
                $mdThemingProvider.theme('dark-green').primaryPalette('green').accentPalette('green').backgroundPalette('green').dark();
                $mdThemingProvider.theme('green').primaryPalette('green').accentPalette('green').backgroundPalette('blue-grey');
                $mdThemingProvider.theme('greennobg').primaryPalette('blue-grey').accentPalette('green');
                $mdThemingProvider.theme('dark-amber').primaryPalette('amber').accentPalette('amber').backgroundPalette('amber').dark();
                $mdThemingProvider.theme('dark-lightgreen').primaryPalette('light-green').accentPalette('light-green').backgroundPalette('light-green').dark();
                $mdThemingProvider.theme('dark-lightblue').primaryPalette('light-blue').accentPalette('light-blue').backgroundPalette('light-blue').dark();
                $mdThemingProvider.theme('lightgreen').primaryPalette('light-green').accentPalette('light-green').backgroundPalette('light-green');
                $mdThemingProvider.theme('dark-indigo').primaryPalette('indigo').accentPalette('indigo').backgroundPalette('indigo').dark();
                $mdThemingProvider.theme('dark-red').primaryPalette('red').accentPalette('red').backgroundPalette('red').dark();
                $mdThemingProvider.theme('red').primaryPalette('red').accentPalette('blue');
                $mdThemingProvider.theme('dark-lime').primaryPalette('lime').accentPalette('lime').backgroundPalette('lime').dark();
                $mdThemingProvider.theme('indigo').primaryPalette('indigo').accentPalette('indigo');
                $mdThemingProvider.theme('blue').primaryPalette('blue').accentPalette('blue');
                $mdThemingProvider.theme('yellow').primaryPalette('yellow').accentPalette('yellow');
                $mdThemingProvider.theme('dark-yellow').primaryPalette('yellow').accentPalette('yellow').backgroundPalette('yellow').dark();
                $mdThemingProvider.alwaysWatchTheme(true);
            }
        )
        .config(['$provide','$locationProvider',function ($provide,$locationProvider) {
            $provide.decorator('$http', ['$delegate', '$localStorage', function($delegate, $localStorage){
                $delegate.defaults.headers.common['Authorization'] =  $localStorage.JWT;
                $delegate.defaults.headers.common["Accept-Language"] = 'es-es';
                return $delegate;
            }]);
            $provide.decorator('mdTooltipDirective',['$delegate',function($delegate){
                return [{
                    restrict: 'A',
                    scope: {
                        'data':'='
                    },
                    compile:function(tElem, tAttrs){
                        tElem.addClass('hint--' + tAttrs.mdTooltip);
                        tElem.addClass('hint--rounded');
                        tElem.attr('style',"overflow: visible;");
                    }
                }];

            }]);
            $locationProvider.html5Mode({
                enabled:true,
                requireBase:true
            });
        }])
        .config(['$mdDateLocaleProvider',function($mdDateLocaleProvider) {
            $mdDateLocaleProvider.formatDate = function(date){
                var m = moment(date);
                var fecha = m.format('YYYY-MM-DD');
                return m.isValid() ?  fecha : '';
            };
        }])
        .config(['$templateRequestProvider','$sceDelegateProvider', function($templateRequestProvider, $sceDelegateProvider){
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                base_directive_templates + '**'
            ]);
            $templateRequestProvider.httpOptions({'headers': {'authorization': undefined}});
        }])
        .config(['$mdIconProvider','$httpProvider', function($mdIconProvider,$httpProvider) {
            $httpProvider.defaults.xsrfHeaderName='X-CSRFToken';
            //registro de íconos externos
            $mdIconProvider
                .icon('jeringa','static/css/icons/hospital/syringe.svg')
                .icon('formulacion','static/css/icons/hospital/prescription.svg')
                .icon('eps','static/css/icons/hospital/hospital-building-front.svg')
                .icon('evento','static/css/icons/hospital/person-with-broken-arm.svg')
                .icon('paciente', 'static/css/icons/hospital/unhealthy-medical-condition.svg')
                .icon('inicio','static/css/icons/hospital/medical-talk-symbol-of-rectangular-speech-bubble-with-a-cross-inside.svg')
                ;
        }])
        .config(['$resourceProvider',function($resourceProvider) {
            $resourceProvider.defaults.stripTrailingSlashes = false;
        }])
        .config(['$mdIconProvider','routeResolverProvider','$controllerProvider','$compileProvider', '$filterProvider', '$provide','$routeProvider',function($mdIconProvider, routeResolverProvider,$controllerProvider,$compileProvider, $filterProvider, $provide,$routeProvider) {
            var routeProviderApp = function(location, route){
                $routeProvider.when(location, routeResolverProvider.route.resolve(route));
            };

            myApp.register ={
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service,
                route: routeProviderApp,
                icon: $mdIconProvider.icon
            };
            
            myApp.register.factory('appMenu', ['$q','DML', function($q,DML){
                var routers = {};
                var routeRegister = myApp.register.route;
                var logo ={};
                return {
                    setRouters:function(client,currentApp){
                        var menu = [];
                        var deferred = $q.defer();
                        var promise = deferred.promise;
                        DML.save({client:client, group:currentApp}, client + '.client.routers',false).then(function(response){
                            routers = response.routers;
                            logo = routers.logo
                            angular.forEach(routers.paths,function(val,key){
                                //Registro de vistas
                                if (val.view) {
                                    routeRegister(val.url, {view:client + '.' + val.view});    
                                }
                                
                                //Generacion de menu
                                if (val.display) {
                                    menu.push({display:val.display,avatar:val.avatar,url:val.url});
                                }
                            });
                            deferred.resolve(menu);
                        });
                        return promise;
                    },
                    getLogo:function(currentApp){
                        return logo;
                    }
                }
            }]);

            routeResolverProvider.routeConfig.setBaseDirectories({
                htmlDir:'static/{app_owner}/html/',
                controllersDir:'static/{app_owner}/js/controllers/'
            });
        }])
    ;   
});
