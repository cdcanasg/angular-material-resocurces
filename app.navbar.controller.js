'use strict';

define(['myApp'],function(myApp){
    myApp
        .controller('navBarCtrl', ['$http','$mdDialog','$templateCache','$scope','user','$mdSidenav','$location','$window','dialog', function ($http,$mdDialog,$templateCache,$scope,user,$mdSidenav,$location, $window,dialog) {
            $scope.user=user;
            $scope.tema = 'default';
            $scope.appTitle= 'Shire';
            
            
            $scope.$on('$locationChangeStart',function(ev,nv,ov){
                $templateCache.removeAll();
            });
            

            $scope.$on('$locationChangeSuccess',function(ev,nv,ov){
                var start = $location.path().indexOf('/',$location.path().indexOf('main/')) + 1;
                var end = $location.path().indexOf('/',start);
                if(end==-1){
                    end = $location.path().length;
                }
                var preRoute = $location.path().substring(start,end);
                switch(preRoute) {
                    case 'angioedema':
                        $scope.tema = 'red';
                        break;
                    case 'psp':
                        $scope.tema = 'dark-lightgreen';
                        break;
                    case 'lisosomal':
                        $scope.tema = 'dark-cyan';
                        break;
                    case 'shirecoord':
                        $scope.tema = 'default';
                        break;
                }
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
