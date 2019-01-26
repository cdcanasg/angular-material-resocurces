'use strict';

define(['myApp'],function(myApp){
    myApp
        .service('DML', ['forms','resource','$q','DRFAPIDefinitions', function(forms,resource,$q,DRFAPIDefinitions){

            var thisDMLObject = this;
            //Datos recuperados de la API
            var serviceData = {};

            //Configuracion de API resources
            var apiList = resource.setAPI(DRFAPIDefinitions);

            angular.forEach(apiList,function(val){
                serviceData[val] = {list:[]};
            });
            
            thisDMLObject.updateAPI = function(clientAPI){
                //Agrega las nuevas definiciones de resources
                resource.setAPI(clientAPI);
                angular.forEach(apiList,function(val){
                    if (!serviceData[val]) {
                        serviceData[val] = {list:[]};
                    }
                    
                });
                forms.updateAPI(clientAPI);
            };

            thisDMLObject.unauthorized = false;

            thisDMLObject.resource = function(config, id=null){
                this.resource = resource[config];
                this.data = id ? {id:id} : null;
            },
            
            thisDMLObject.resource.prototype.action = function(action){
                return this.resource[action](this.data);
            }

            thisDMLObject.get = function(property){
                var success = function(){
                    
                };

                var error = function(response){
                    if(response.status == 401 && !thisDMLObject.unauthorized){
                        thisDMLObject.unauthorized = true;
                        thisDMLObject.onUnauthorizedError('Ha pasado el tiempo de acceso');
                    }
                };
                if (angular.isUndefined(property)) {
                    property = apiList;                                
                }else if(angular.isString(property)){
                    if(typeof resource[property] != 'undefined'){
                        serviceData[property].list = resource[property].query();
                        serviceData[property].list.$promise.then(success,error);
                        return serviceData[property];
                    }else{
                        console.error('No existe la api: ' + property);
                        return {};
                    }
                }else if(angular.isObject(property)){
                    var apiDefinition = Object.keys(property)[0];
                    if(property[apiDefinition] == null || Object.keys(property[apiDefinition])[0] == 'id'){
                        if(serviceData[apiDefinition]){
                            serviceData[apiDefinition].sublist = resource[apiDefinition].get(property[apiDefinition]);
                        }else{
                            console.error('No existe la api: ' + apiDefinition);
                            return {};
                        }
                        
                    }else{
                        if (resource[apiDefinition]) {
                            serviceData[apiDefinition].sublist = resource[apiDefinition].query(property[apiDefinition]);
                        }else{
                            console.error('No existe la api: ' + apiDefinition);
                        }
                    }
                    return serviceData[apiDefinition];
                }

                angular.forEach(property,function(val){
                    serviceData[val].list = resource[val].query(); 
                });

                return serviceData;
            };

            thisDMLObject.update = function(params, element, callback){
                return resource[element].update(params);
            };

            thisDMLObject.delete = function(){
                var deleteF = new HTTPRequest.postRequest(element.component, element.controller + '.delete',newObject);
                deleteF.then(function(response){

                });
            };

            thisDMLObject.save = function(newObject, element, getList=false){
                if (resource[element]) {
                    var defer = $q.defer();
                    var promise = defer.promise;
                    var createF = resource[element].save(newObject).$promise;
                    createF.then(success, failed);

                    return promise;
                }else{
                    console.error('No existe la api: ' + element);
                }

                function success(response){
                    if (!serviceData.hasOwnProperty(element)) {
                        serviceData[element] = {};
                    }
                    
                    if(getList){
                        serviceData[element]['list'] = resource[element].query();
                    }
                    defer.resolve(response);
                }

                function failed(response){
                    defer.reject(response.data)
                    if(response.status == 401 && !thisDMLObject.unauthorized){
                        thisDMLObject.unauthorized = true;
                        thisDMLObject.onUnauthorizedError('Ha pasado el tiempo de acceso');
                    }
                }
            };

            thisDMLObject.post = thisDMLObject.save;

            thisDMLObject.getItemFromList = function(object, element, selectedList='list'){

                var objKey = Object.keys(object)[0];
                var result = null;

                if(!object[objKey]){
                    return result;
                }else if(typeof element=='string'){
                    angular.forEach(serviceData[element][selectedList], function(value ,key){
                        if (object[objKey] == value[objKey]) {
                            result  = value;
                        }
                    });
                }else if(Array.isArray(element)){
                    angular.forEach(element, function(value ,key){
                        if (object[objKey] == value[objKey]) {
                            result  = value;
                        }
                    });
                }
                
                return result;
            };

            thisDMLObject.getArrayFromList = function(needleArray, element, needleKey = 'id', elementKey="id", selectedList = 'list'){
                var result = [];
                angular.forEach(needleArray, function(val1, key1){
                    var itemToSearch = val1;
                    var breakFor = false;
                    angular.forEach(serviceData[element][selectedList], function(val2 ,key2){
                        if (!breakFor) {
                            if (itemToSearch == val2[elementKey]) {
                                result.push(val2);
                                breakFor = true;
                            }
                        }
                    });
                });

                return result;

            };

            thisDMLObject.getSubList = function(data, element){
                element.queryType={
                    list:false,
                    sublist:true,
                    innerlist:false
                };
                var getSubListF = new HTTPRequest.postRequest(element.component, element.controller + '.getSubList', data);
                getSubListF.then(function(response){
                    element.sublist = response;
                });
            };
            
            thisDMLObject.multipleFieldsSearch = function(data, element){
                element.queryType={
                    list:false,
                    sublist:true,
                    innerlist:false
                };
                var getSubListF = new HTTPRequest.postRequest(element.component, element.controller + '.multipleFieldsSearch', data);
                return getSubListF;
                getSubListF.then(function(response){
                    element.sublist = response.list;
                });
            };

            thisDMLObject.getInnerList = function(filter, element){
                
                element.queryType={
                    list:false,
                    sublist:false,
                    innerlist:true
                };

                var innerResult= [];
                var keyFilter = Object.getOwnPropertyNames(filter)[0];
                var valueFilter = filter[keyFilter];
                for (keyArray in element.list){
                    rowContains = false;
                    if(element.list[keyArray][keyFilter] == valueFilter){
                        element.list[keyArray][filter];
                        innerResult.push(element.list[keyArray]);
                    }
                }
                element.innerlist = innerResult;
            };

            thisDMLObject.getFormObject = function(dataObject, element){
                var returnObject = {};
                for (key in dataObject){
                    returnObject[element.formFields[key]] = dataObject[key]; 
                }

                return returnObject;
            };
        }])
    ;    
});
