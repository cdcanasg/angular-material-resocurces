'use strict';

define(['myApp','deepmerge'],function(myApp,deepmerge){
    myApp
        .factory('setData',function($document){
            var configurarDatos={};

            configurarDatos.listToBarChart=function(data,propiedad){
                var returnData={data:[[]],labels:[],series:[]};

                for (key in data){
                    returnData.data[0].push(data[key][propiedad]);
                    returnData.labels.push(data[key].titulo);
                }
                returnData.series.push(propiedad);

                return returnData;

            };

            configurarDatos.getUrlBlob = function(inputData,extension){
                var url ='';
                try{
                    var currentBlobImage = base64toBlob(inputData, extension);
                    url = URL.createObjectURL(currentBlobImage);
                }catch(e){
                    url = inputData;
                }
                
                return url;
            };

            configurarDatos.header=function(){
                var header={data:[]};
                header.setData=function (name,value){
                    header.data.push({name:name,value:value});
                }
                return header;
            };
            configurarDatos.infoInput=function(id,name,tag,value){
                return {
                    'name':name,
                    'editMode':false,
                    'showEdit':false,
                    'tag':tag,
                    'value':value,
                    'id':id,
                    'error':{}
                }
            };

            configurarDatos.setHeaderOnTop=function(){
                var myElement = angular.element($document[0].querySelector('#body-content'));
                myElement.context.scrollTop=0;
            };

            function base64toBlob(base64Data, extension) {
                
                var extensionDefinitions = {
                    png:'image/png',
                    jpeg: 'image/jpeg',
                    jpg: 'image/jpg',
                    pdf: 'application/pdf'
                };
                
                var contentType = extensionDefinitions[extension];
                var sliceSize = 1024;
                var byteCharacters = atob(base64Data);
                var bytesLength = byteCharacters.length;
                var slicesCount = Math.ceil(bytesLength / sliceSize);
                var byteArrays = new Array(slicesCount);

                for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    var begin = sliceIndex * sliceSize;
                    var end = Math.min(begin + sliceSize, bytesLength);

                    var bytes = new Array(end - begin);
                    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);
                }
                return new Blob(byteArrays, { type: contentType });
            }

            return configurarDatos;
        })

        .factory('openCloseChat',function(){
            var openClose={
                value:false,
                showViews:{
                    usuariosOnline:false,
                    activeChats:false,
                    messages:true
                }
            };

            openClose.set=function(value){
                openClose.value=value;
            };

            openClose.setDefaultViews=function(){
                openClose.showViews={
                    usuariosOnline:false,
                    activeChats:false,
                    messages:true
                };
            }

            openClose.setUserData=function(value){
                userData.data=value;
                userData.data.password=hashCode(value.id);
            };

            hashCode=function(string){
                var hash = 0;
                if (string.length == 0) return hash;
                for (i = 0; i < string.length; i++) {
                    char = string.charCodeAt(i)+String.fromCharCode(67 + i);
                    hash = hash+char;
                }
                return hash;
            }

            return openClose;
        })
        .factory('dialog',['$mdDialog',function($mdDialog){
            var dialog={};
            var showParams = {};
            dialog.set=function(config){
                
                config.clickOutsideToClose=true;
                config.bindToController=true;
                if (config.data) {
                    config.locals={editData:config.data,editMode:true};
                }
                if (config.override) {
                    config.locals.overrideSelected = overrideSelected;
                }

                showParams = config;
            };

            dialog.get=function(){
                return $mdDialog.show(showParams);
            };

            dialog.confirm=function(text){
                $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Registro exitoso')
                    .textContent(text)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Ok')  
                );
            };

            dialog.close = function(message){
                $mdDialog.hide(message);
            };
            
            dialog.loggedOut = function(message){
                var loggedOut = $mdDialog.alert()
                    .title('Usuario fuera del sistema')
                    .textContent(message)
                    .ok('cerrar');
                $mdDialog.show(loggedOut);
            }

            return dialog;
        }])
        .factory('user',['appMenu','$http','$location','$q','DML','$localStorage','dialog',function(appMenu,$http,$location,$q,DML,$localStorage,dialog){
            var user={
                loggedIn:false
            };
             var requestState = {};

            var setUser = function(data){
               angular.forEach(data, function(val, key){
                    user[key] = val;
                });
            };

            var setAuth = function(token){
                $localStorage.JWT ='JWT ' + token;
                $http.defaults.headers.common.Authorization = $localStorage.JWT;
            };

            var unsetAuth = function(message){
                user.loggedIn = false;
                delete $localStorage.JWT;
                delete $http.defaults.headers.common.Authorization;
                $location.path('/');
                dialog.loggedOut(message);
                return true;
            };
            
            var loginSuccessful = function(response){
                setAuth(response.token);
                setUser(response.user);
                DML.unauthorized = false;
                goToApp(user.groups[0]).then(function(response){
                    $location.path(response.url);
                    user.loggedIn = true;
                });
            };

            var loginFailed = function(response){
                requestState.login = false;
                if (response.status==400) {
                    dialog.loggedOut(response.data.non_field_errors[0]);
                }else{
                    dialog.loggedOut(response.detail);
                } 
            };

            var goToApp = function(groups){
                var deferred = $q.defer();
                var promise = deferred.promise;
                var preRoute = $location.path().substring(1,$location.path().indexOf('main/'));
                var postRoute = $location.path().substring($location.path().indexOf('/main'));
                var groupName = groups.name;
                var client = groups.cliente;
                var urlBase = '';
                angular.forEach(groups,function(val, key){
                    if(val.name==preRoute){
                        groupName = val.name;
                    }
                });

                user.currentApp = groupName;
                urlBase = '/' + client + '/';
                $location.path(urlBase);
                //Configura la aplicacion actual, registra las vistas en los routeProvider y retorna la lista de menus
                require(['static/' + client + '/js/services/factories.js', 'static/' + client + '/js/' + global_app_owner + '.config.js'],function(){
                    appMenu.setRouters(client,groupName).then(function(menu){
                        user.logo = appMenu.getLogo(client,groupName);
                        user.menu = menu;
                        DML.save({client: client},'' + global_app_owner + '.client.endpoints',false).then(function(response){
                            DML.updateAPI(response.api);
                            deferred.resolve({'url': urlBase + groupName});
                        });
                    });
                });
                return promise;
            };

            user.goToApp = goToApp;
            
            user.goToApp = function(group){
                goToApp(group).then(function(urlObject){
                    $location.path(urlObject.url);
                });
            };

            //Set DML.onUnathorized
            DML.onUnauthorizedError = unsetAuth;

            user.login = function(userData){
                DML.save(userData, global_app_owner + '.auth.login',false).then(loginSuccessful, loginFailed);
                requestState.login = true;
                return requestState;
            };

            user.logout = function(){
                DML.save({},global_app_owner + '.auth.logout',false).then(function(){
                    unsetAuth('Ha salido del sistema');
                },function(response){
                    loginFailed(response);
                    unsetAuth('Error de salida');
                });
                
            };
            
            user.verifyAuth = function(){
                var invoke_api = {};
                invoke_api[global_app_owner + '.auth.user'] = null;
                DML.get(invoke_api).sublist.$promise.then(function(response){
                    setUser(response);
                    goToApp(user.groups[0]).then(function(response){
                        $location.path(response.url);
                        user.loggedIn = true;
                        DML.unauthorized = false;
                    });
                },function(response){
                    unsetAuth('Autentiquese en el sistema');
                });
            };

            user.redirect = function(route, id=null){
                var deferred = $q.defer();
                var promise = deferred.promise;
                var urlArray = route.split('.');
                var redirect_client = urlArray[0];
                var redirect_app = urlArray[1];
                var redirect_resource = urlArray[2];
                var url = redirect_client + '/' + redirect_app + '/' + redirect_resource;
                if (id) {
                    url = url + '/' + id;
                }
                user.currentApp = urlArray[0];
                $location.path(url);
            };

            return user;
        }])

        .factory('forms', ['$q','routeResolver','dialog', 'DRFAPIDefinitions', function($q,routeResolver,dialog,DRFAPIDefinitions) {
            var forms={
                formObject:{}
            };

            var privateObject = {url:{}};

            privateObject.getFormList = function(APIDefinition){
                var returnObject = {};
                angular.forEach(APIDefinition,function(apps,client){
                    angular.forEach(apps,function(models,app){
                        angular.forEach(models,function(form,model){
                                var modelName = client + '.' + app + '.' + model;
                                var formPath = app + '/' + model + '.html';
                                var formValue = {
                                    text: model,
                                    icon:client + ':' + app + ':' + model,
                                    form:modelName,
                                    formPath:formPath,
                                    client: client
                                };
                                returnObject[modelName]=formValue;
                        });
                    })
                })
                return returnObject;
            };

            //set formButtons
            var formList = privateObject.getFormList(DRFAPIDefinitions);
            var callbacks = {};
            var error = {};

            privateObject.setUrl=function(formList){
                angular.forEach(formList,function(val,key){
                    privateObject.url[key]='static/' + val.client + '/html/forms/' + val.formPath.toLowerCase();    
                });
            };
            
            privateObject.setUrl(formList);

            privateObject.getUrl = function(form){
                return privateObject.url[form];
            };
            
            forms.updateAPI =function(DRFAPI){
                formList = privateObject.getFormList(DRFAPI);
                privateObject.setUrl(formList);
            };

            forms.getButtons = function(filter){
                var returnArray = [];
                angular.forEach(filter, function(val,key){
                    if (formList[val]) {
                        returnArray.push(formList[val]);
                    }
                });

                return returnArray;
            };

            forms.show = function(objectParams){
                var deferred = $q.defer();
                var promise = deferred.promise;
                objectParams.data = objectParams.data ? objectParams.data : null;
                objectParams.overrideSelected = objectParams.overrideSelected ? true : false;

                var dialogConfig = routeResolver.route.resolve({form:objectParams.form});
                dialogConfig.targetEvent = objectParams.ev;
                dialogConfig.data = objectParams.data;
                dialogConfig.override = objectParams.overrideSelected;

                dialog.set(dialogConfig);
                var response=dialog.get();
                response.then(function(formResponse){
                    if(formResponse){
                        if(Object.keys(formResponse)[0]!='jumpToForm'){
                            dialog.confirm(formResponse);
                        }
                        
                    }
                    deferred.resolve(formResponse);
                });
                return promise;
            };

            forms.getInclude = function(include){
                var basePath = 'static/',
                includeConfig = include.split('.'),
                path = basePath + includeConfig[0] + '/html/forms/' + includeConfig[1] + '/includes/' + includeConfig[2] + '.html';
                
                return path;
            };

            forms.hide = function(message){
                error = {};
                var messageDisplayed = '';
                if(message.$resolved && Object.keys(message)[0] != 'jumpToForm'){
                    angular.forEach(message,function(val,key){
                        if(key=='nombre'){
                            messageDisplayed = messageDisplayed + key + ': ' + val + '\n';
                        }
                    });
                    messageDisplayed = messageDisplayed !='' ? messageDisplayed : message.$resolved;
                }else{
                    messageDisplayed = message;
                }
                dialog.close(messageDisplayed);
            };
            forms.setError = function(message){
                forms.formObject.$submitted = false;
                error.detail = message.detail;
            };

            forms.getError = function(){
                return error;
            };

            forms.getDateString = function(assign,date){
                var key = Object.keys(date)[0];
                assign[key] = moment(date[key]).format('YYYY-MM-DD');
            };

            forms
            return forms;
        }])
        .factory('views', ['$q', function($q){
            var views = {},
            view_theme = 'default',
            theme_defer = $q.defer();

            views.getIncludePath = function(include){
                if(include  && include!=""){
                    var basePath = '/static/',
                    includeConfig = include.split('.'),
                    path = basePath + includeConfig[0] + '/html/views/' + includeConfig[1] + '/includes/' + includeConfig[2] + '/' + includeConfig[3] +  '.html';
                    
                }else{
                    path = undefined;
                }
                return path;
            };
            views.setTheme = function(theme, icon=null){
                var returnObject = {'theme': theme};
                if(icon){
                    returnObject.icon = icon;
                }
                theme_defer.resolve(returnObject);
            };

            views.getTheme = function(){
                if(theme_defer.promise.$$state.status=1){
                    theme_defer = $q.defer();
                }
                return theme_defer.promise;
            }

            return views;
        }])
        .factory('plot', [function(){

            //Variable de retorno
            var plot = {};

            //Variables internas
            var thisPlot = this;

            thisPlot.setCleanParams = function(){
                //Variables internas
                thisPlot.data = [];
                thisPlot.series = [];
                delete thisPlot.seriesObject;
                thisPlot.seriesKey = '';
                thisPlot.labels = [];
                thisPlot.tipo = 'bar';
                thisPlot.options ={};
                thisPlot.plot = {};
                thisPlot.dataFields = [];
                thisPlot.isSetLabels = false;
                thisPlot.isSetSeries = false;
                thisPlot.isSetData = false;
                thisPlot.labelObject = {};
                thisPlot.stringFields = [];
                thisPlot.valueField = '';
            };

            thisPlot.setCleanParams();

            plot.get=function(config){
                
                thisPlot.setCleanParams();
                plot.setData(config.data,config.axis);
                plot.setTipo(config.tipo);
                plot.setOptions(config.options, config.tipo);
                plot.setDownloadData(config.data, config.filename);

                thisPlot.plot={
                    data:thisPlot.data,
                    series:thisPlot.series,
                    labels:thisPlot.labels,
                    tipo:thisPlot.tipo,
                    options:thisPlot.options,
                    download:thisPlot.downloadData
                };
                return thisPlot.plot;
            };

            plot.setData = function(data,axis){
                if (!thisPlot.isSetSeries) {
                    plot.setSeries(data,axis);
                }
                if (!thisPlot.multipleSeries) {
                    angular.forEach(thisPlot.series,function(serie){
                        var serieSet = [];
                        angular.forEach(thisPlot.labels,function(label){
                            angular.forEach(data,function(object){
                                if (object[thisPlot.labelField] == label) {
                                    serieSet.push(object[thisPlot.valueField]);
                                }
                            });
                        });
                        thisPlot.data.push(serieSet);
                    });
                }else{
                    angular.forEach(axis.series[thisPlot.seriesKey],function(val,key){
                        var serieData = [];
                        angular.forEach(thisPlot.labels,function(){this.push(0);},serieData);
                        angular.forEach(data,function(val2,key2){
                            if (val.id==val2[thisPlot.seriesKey]) {
                                var valuePosition = 0;
                                angular.forEach(thisPlot.labels,function(val3, key3){
                                    if (val3 == val2[thisPlot.labelField]) {
                                        valuePosition = key3;
                                    }
                                });
                                serieData[valuePosition] = val2[thisPlot.valueField];
                            }
                        });
                        thisPlot.data.push(serieData);
                    });
                }

                return thisPlot.data;
            };

            plot.setOptions = function(options={},tipo){
                var key ='';
                thisPlot.options.maintainAspectRatio=false;
                thisPlot.options.responsive=true;
                thisPlot.options.legend={display:true};

                if (thisPlot.tipo!='pie' && thisPlot.tipo!='doughnut') {
                    thisPlot.options.scales= {
                        'xAxes': [
                            {'ticks': {'autoSkip' : false}}
                        ],
                        'yAxes':[
                            {
                                'ticks': {
                                    //'fixedStepSize':1
                                    //,'beginAtZero':true
                                }
                            }
                        ]
                    };

                    //Configurar escala de tiempo
                    if (tipo=='time') {
                        if(thisPlot.tipo=='line'){
                            thisPlot.options.scales.xAxes[0].type='time';
                        }
                    }

                    thisPlot.options.tooltips={
                        enabled:true,
                        mode:'label',
                        callbacks:{}
                    };

                }

                if (thisPlot.tipo == 'radar') {
                    thisPlot.options.scales = {};
                }

                for(key in options){
                    thisPlot.options[key]=options[key];
                }

                return thisPlot.options;
            };

            plot.setTipo = function(tipo='bar'){
                if (tipo!='bar') {
                    if (thisPlot.data[0].length==1) {
                        thisPlot.tipo='bar';
                    }else{
                        if (tipo=='time') {
                            thisPlot.tipo='line';
                        }else if(tipo=='pie'){
                            thisPlot.tipo=tipo;
                            thisPlot.series=thisPlot.labels;
                            thisPlot.data = thisPlot.data[0];
                        }else{
                            thisPlot.tipo=tipo;
                        }
                    }
                }
                return thisPlot.tipo;
            };

            plot.setDownloadData = function(data,filename='name'){

                thisPlot.downloadData={
                    fields:{}
                };
                thisPlot.downloadData.data=angular.copy(data);
                if(thisPlot.seriesObject){
                     angular.forEach(thisPlot.downloadData.data,function(val){
                         angular.forEach(thisPlot.seriesObject,function(val2){
                             if(val[thisPlot.seriesKey]==val2.id){
                                 val[thisPlot.seriesKey]=val2.nombre;
                             }
                         });
                    });
                    thisPlot.downloadData.fields[thisPlot.seriesKey]=thisPlot.seriesKey;
                }

                thisPlot.downloadData.filename=filename;
                thisPlot.downloadData.fields[thisPlot.labelField]=thisPlot.labelField;
                thisPlot.downloadData.fields[thisPlot.valueField]=thisPlot.valueField;

                return thisPlot.downloadData;
            };

            plot.setSeries = function(data,axis){
                thisPlot.seriesKey = '';
                var numberOfSeries = 0;
                thisPlot.valueField = Object.keys(axis.y)[0];

                //Obtencion de las claves de los datos
                if (axis.series) {
                    thisPlot.seriesKey = Object.keys(axis.series)[0];
                    angular.forEach(axis.series[thisPlot.seriesKey], function(val){
                        this.push(val.nombre);
                    },thisPlot.series);
                    thisPlot.seriesObject = angular.copy(axis.series[thisPlot.seriesKey]);
                    numberOfSeries = thisPlot.series.length;
                }else{
                    thisPlot.seriesKey = thisPlot.valueField;
                    thisPlot.series = [axis.y[thisPlot.valueField]];
                }

                thisPlot.multipleSeries = numberOfSeries > 1 ? true : false;

                thisPlot.isSetSeries = true;
                if (!thisPlot.isSetLabels) {
                    plot.setLabels(data,axis.x);
                }

                return thisPlot.series;

            };

            plot.setLabels = function(data,config){
                if (!thisPlot.isSetSeries) {
                    plot.setSeries(data);
                }else{
                    //Verifica si existen multiples campos para la configuracion de series
                    thisPlot.labelField = Object.keys(config)[0];

                    angular.forEach(data,function(val){
                        this[val[thisPlot.labelField]]=true;
                    },thisPlot.labelObject);

                    //Configura las etiquetas de la grafica
                    thisPlot.labels = Object.keys(thisPlot.labelObject);
                    thisPlot.isSetLabels = true;
                    return thisPlot.labels;
                }
            };

            return plot;
        }])
    ;    
});
