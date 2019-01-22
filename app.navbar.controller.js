'use strict';

define(['myApp'],function(myApp){
    myApp
        .controller('navBarCtrl', ['views','$http','$mdDialog','$templateCache','$scope','user','$mdSidenav','$location','$window','dialog', function (views,$http,$mdDialog,$templateCache,$scope,user,$mdSidenav,$location, $window,dialog) {
            $scope.user=user;
            $scope.tema = 'default';
            $scope.appTitle= 'Shire';
            
            if ($location.host()=='127.0.0.1') {
                $scope.$on('$locationChangeStart',function(ev,nv,ov){
                    $templateCache.removeAll();
                });
            }
            

            $scope.$on('$locationChangeSuccess',function(ev,nv,ov){
                var start = $location.path().indexOf('/',$location.path().indexOf('main/')) + 1;
                var end = $location.path().indexOf('/',start);
                if(end==-1){
                    end = $location.path().length;
                }
                var preRoute = $location.path().substring(start,end);
                views.getTheme().then(function(response){
                    $scope.tema = response;
                });
                user.currentApp = preRoute;
                $mdSidenav('latMenu').close();
                $mdDialog.hide();
            });

            $scope.user.verifyAuth();

            $scope.toggleMenu = function(){
                $mdSidenav('latMenu').toggle();
            };

            $scope.openDataCard = function($mdMenu, ev) {
                originatorEv = ev;
                $mdMenu.open(ev);
            };

            $scope.logout = function (){
                user.logout();
            };
    }]);
});
