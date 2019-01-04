'use strict';

define(['myApp'],function(myApp){
    myApp.factory('resource', ['$resource', function($resource){
        var resources = {};
        var apiList = [];

        //Configuracion de resources;
        resources.setAPI = function (RESTAPIDefinitions){
            angular.forEach(RESTAPIDefinitions,function(clientAPI,client){
                angular.forEach(clientAPI,function(models, app){
                    angular.forEach(models,function(actions,model){
                        var actionsResources = {update: {method: 'PATCH', hasBody: true}};
                        angular.forEach(actions,function(config,action){
                            config.params = {detail: action};
                            config.method = 'GET';
                            config.isArray = true;
                            actionsResources[action]=config;
                        });
                        var apiPoint = client + '.' + app + '.' + model;
                        var url ='/api/' + client + '/' + app + '/' + model + '/:id/:detail/';
                        resources[apiPoint] = $resource(
                            url,
                            {id:'@id', 'detail':'@detail'},
                            actionsResources
                        );
                        apiList.push(apiPoint);
                    }); 
                });
            });

            return apiList;
        };

        //Retorno de DML
        return resources;

        //Declaracion de resources    
    }])
});
