'use strict';

define(['myApp'],function(myApp){
    myApp
        .directive('autocomplete',['dtURL','DML',function(dtURL,DML){
            return {
                'restrict': 'E',
                'scope':{
                    'service': '@',
                    'itemSeleccionado': '=',
                    'icon': '@',
                    'placeholder': '@',
                    'changeFunction':"&changeFunction",
                    'searchFields': "=",
                    'itemSettings': '=',
                    'notFoundAction': '=',
                    'notFoundActionText': '@'
                },
                'compile': function(element,attrs){
                    return {
                        'post':function(scope,element,attrs){
                            scope.querySearch = function(textoBuscado){
                                var searchObject = {};
                                searchObject[scope.service] = {};
                                angular.forEach(scope.searchFields,function(val){
                                    searchObject[scope.service][val] = textoBuscado;
                                });
                                return DML.get(searchObject).sublist.$promise;
                            }
                        }
                    }
                },
                'templateUrl': dtURL + 'autocomplete.html'
            }
        }])
        .directive('infoInput', function(dtURL) {
            return {
                restrict: 'E',
                scope: {
                    data:'=',
                    tag:'@',
                    inputFunction: '&inputFunction',
                    error: '=',
                    fieldShowed: '@',
                    type: '@'
                },
                link: function(scope, element, attrs) {
                    element.addClass('flex');
                    scope.disableEdit = !('enableUpdate' in attrs) ? true : false;
                    scope.editMode = false;
                    scope.showEdit = false;
                    scope.dataIsDate = false;

                    var editButton = angular.element(element[0].querySelector('#fixed-text'));
                    editButton.css('height','40px');
                    
                    scope.$watch('data',function(nv, ov){
                        if(nv){
                            if (scope.data[scope.fieldShowed] instanceof Date || scope.type=="Date") {
                                scope.dataIsDate = true;
                            }
                        }
                    });

                    scope.updateData = function(params){
                        var updateObject = {};
                        updateObject[params.field] = params.data[params.field];
                        scope.data.$update(updateObject).then(function(response){
                            if(response.$resolved){
                                scope.editMode = false;
                            }
                        });
                    };
                }, 
                templateUrl: dtURL+'infoinput.html'
            }
        })

        .directive('infoSelect', function(dtURL, DML) {
            return {
                restrict: 'E',
                scope: {
                    data:'=',
                    tag:'@',
                    options:'@',
                    queryOptions:'=',
                    error:'=',
                    fieldShowed: '@',
                    optionField:'@',
                    optionFilter:'='
                },
                templateUrl: dtURL+'infoselect.html',
                link:function(scope,element,attrs){
                    element.addClass('flex');
                    scope.editButton = angular.element(element[0].querySelector('#fixed-text'));
                    scope.editButton.css('height','40px');
                    scope.disableEdit = !('enableUpdate' in attrs) ? true : false;
                    scope.disableQueryList = !(scope.queryOptions)? true : false;
                    scope.editMode = false;
                    scope.showEdit = false;

                    scope.$watch('data', function(nv){
                        if(nv){
                            scope.data.$promise.then(function(){
                                if (scope.disableQueryList) {
                                    if(!scope.optionFilter){
                                        scope.innerOptions = DML.get(scope.options).list;
                                    }else{
                                        var resourcePointer = {},
                                        optionFilterKey =Object.keys(scope.optionFilter)[0],
                                        optionFilterValue = scope.optionFilter[optionFilterKey];

                                        resourcePointer[scope.options]={};
                                        resourcePointer[scope.options][optionFilterValue] = scope.data[optionFilterKey];
                                        scope.innerOptions = DML.get(resourcePointer).sublist;
                                    }
                                    
                                    scope.innerOptions.$promise.then(function(){
                                        scope.dataSelected = DML.getItemFromList({id: scope.data[scope.fieldShowed]}, scope.options);
                                    });
                                }else{
                                    var setObjectQuery = {};
                                    setObjectQuery[scope.options] = {id: scope.data[scope.fieldShowed]};
                                    scope.dataSelected = DML.get(setObjectQuery).sublist;
                                };
                            });
                        }
                    });
                    

                    scope.updateData = function(params){
                        if (params.data!=null) {
                            var updateObject = {};
                            scope.data[params.field] = params.data.id;
                            scope.data.$update().then(function(response){
                                if(response.$resolved){
                                    scope.editMode = false;
                                    scope.dataSelected = params.data;
                                }
                            });
                        }else{
                            scope.editMode = false;
                        }
                    };
                }
            }
        })

        .directive('infoDatepicker', function(dtURL) {
            return {
                restrict: 'E',
                scope: {
                    'data':'=',
                    'guardarCambios': '&guardarCambios'
                },
                templateUrl: dtURL+'infodatepicker.html'
            }
        })

        .directive('infoTabla', function(dtURL) {
            return {
                restrict: 'E',
                scope: {
                    titulo:'@',
                    data:'=',
                    progressBar:'=',
                    itemFuncion: '&itemFuncion',
                    itemIcon:'@',
                    filaFuncion:'&filaFuncion',
                    tablaFuncion:'&tablaFuncion',
                    tablaIcon:'@',
                    tablaTooltip:'@',
                    itemTooltip:'@',
                    settings: '=',
                    switchFuncion:'&',
                    tituloSwitch:'@',
                    claveSwitch:'='
                },
                link:function(scope, element, attrs){
                    scope.dataToExport={};
                    scope.dataToExport.exists =  attrs.hasOwnProperty('exportarCvs') ? true : false;
                    scope.isTablaFunction=attrs.hasOwnProperty('tablaFunction')? true : false;
                    scope.isItemFunction=attrs.hasOwnProperty('itemFuncion')? true : false;
                    scope.showSwitchPresent=attrs.hasOwnProperty('switchFuncion')? true : false;
                    scope.itemIcon=attrs.hasOwnProperty('itemIcon')==""? attrs.itemIcon : 'edit ';
                    
                    //Configuración de los datos de la tabla cuando el servidor responde con nuevos
                    scope.$watch('data',function(nv,ov){
                        if (typeof nv !='undefined') {
                            scope.columnsData=[];
                            scope.columnsData=setColumnsData(nv, scope.settings);
                            scope.rowsData=setData(nv,scope.columnsData);
                            scope.datosAExportar=setExportData(nv,scope.columnsData,scope.titulo);
                        }
                    });

                    //Cambio del z-index del subheader compilado
                    var subheader = angular.element(angular.element(element[0].querySelector('#tableSubheader')))[0];
                    subheader.style.zIndex = 1;                

                    scope.isolateFilaFuncion = function(rowKey, ev){
                        scope.filaFuncion({ev:ev, item:{key:rowKey, value: scope.data[rowKey]}});
                    };

                    scope.isolateSwitchFuncion = function(key, state){
                        scope.switchFuncion({state:state, value:scope.data[key]});
                    };

                    //set table headers
                    function setColumnsData(nv,settings=null){
                        columnsDataObject={};
                        rt=[];
                        scope.switchValue = [];
                        for(arrayKey in nv){
                            if (settings) {
                                for(settingsKey in settings){    
                                    for(objectKey in nv[arrayKey]){
                                        firstChar=objectKey.charAt(0);
                                        if (firstChar!='$') {
                                            if (settings[settingsKey]==objectKey) {
                                                columnsDataObject[objectKey]={value:objectKey};
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        for (key in columnsDataObject){
                            rt.push(columnsDataObject[key]);
                        }
                        return rt;
                    }
                    function setData(nv,cd){
                        dataRows=[];
                        rt=[];
                        for (key in nv){
                            dataRow=[];
                            for(key2 in cd){
                                for(key3 in nv[key]){
                                    if (cd[key2].value==key3) {
                                        dataRow[key2]={value:nv[key][key3]};
                                    }
                                    if (scope.showSwitchPresent) {
                                        clave = Object.keys(scope.claveSwitch)[0];
                                        if (key3 == clave) {
                                            scope.switchValue[key]=scope.claveSwitch[clave] == nv[key][key3] ? true : false;    
                                        }else{

                                        }
                                    }
                                }
                            }
                            dataRows.push(dataRow);
                        }

                        return dataRows;

                    }

                    function setExportData(nv,fl,title){
                        fields={};
                        for(key in fl){
                            fields[fl[key].value]=fl[key].value;
                        }
                        data=nv;
                        filename=title;

                        return {data:data,fields:fields,filename:filename};
                    }
                },
                templateUrl: dtURL+'tabla.html'
            }
        })
        .directive('observacionesPrueba', function(dtURL) {
            return {
                restrict: 'E',
                scope: {
                    'data':'='
                },
                templateUrl: dtURL+'obsprueba.html'
            }
        })
        .directive('dashboardTitle', ['$http','dtURL','$location',function($http,dtURL,$location) {
            return {
                restrict: 'E',
                scope: {
                    'titulo':'@'
                },
                link:function(scope){
                    scope.$watch(function() {
                        return $http.pendingRequests.length;
                    }, function(petitions) {
                        if(petitions==0){
                            scope.loadVariable = false;
                        }else{
                            scope.loadVariable = true;
                        }
                    });
                },
                templateUrl: dtURL+'dashboardtitle.html'
            }
        }])
        .directive('datosHeader',function(dtURL){
            return{
                restrict:'E',
                scope:{
                    'data':'=',
                    'showData':'=',
                    'config':'='
                },
                templateUrl:dtURL+'datosheader.html',
                link:function(scope, element, attrs){
                    var configKey = '';
                    var headerTag = '';
                    scope.$watchCollection('data',function(nv, ov){
                        if(nv!=ov){
                            scope.isolateData = [];
                            var configIsObject = !angular.isArray(scope.config);
                            angular.forEach(scope.config, function(v1, k1){
                                configKey = configIsObject ? k1 : v1;
                                headerTag = v1;
                                angular.forEach(scope.data, function(v2, k2){
                                    if (configKey==k2) {
                                        scope.isolateData.push({
                                            value:v2,
                                            name:headerTag
                                        });
                                    }
                                });
                            });
                        };   
                    });
                }
            }
        })
        .directive('cardList3Line', ['DML','dtURL','setData',function(DML,dtURL,setData){
            return {
                restrict:'E',
                scope:{
                    titulo:'@',
                    subtitulo:'@',
                    showDatos:'=',
                    icon:'@',
                    listFunction:'&listFunction',
                    data:'=',
                    settings:'=',
                    switchFunction:'&',
                    claveSwitch:'=',
                    iconSettings:'=',
                    cardFunction:'=',
                    foreignList: '='
                },
                templateUrl:dtURL+'cardlist3line.html',
                transclude:{
                    plusTitle:'?plusTitle'
                },
                compile:function(tElement, tAttrs){
                    //Configuración del tooltip
                    var tooltipValue = 'bottom-left';
                    if (tAttrs.tooltip) {
                        tooltipValue = tAttrs.tooltip;
                    }

                    var downloadButton = angular.element(tElement[0].querySelector('#download-button'));
                    downloadButton.attr('md-tooltip',tooltipValue);

                    //Configuración de la lista
                    if (typeof tAttrs.dense != 'undefined') {
                        var listElement = angular.element(tElement.children().children().children().children()[2]);
                        listElement.addClass('md-dense');
                    }
                    
                    // Configuración de la fuente del ícono
                    var iconElement = angular.element(tElement[0].querySelector('#icon-element'));
                    if (typeof tAttrs.svgIcon != 'undefined'){
                        iconElement.attr('md-svg-icon',tAttrs.icon);
                    }else{
                        iconElement.attr('md-font-icon','material-icons md-36');
                    }

                    var settingsString = tAttrs.settings.replace(/\'/g,'"');
                    settingsString = settingsString.replace(/{/g,'{"');
                    settingsString = settingsString.replace(/,/g,',"');
                    settingsString = settingsString.replace(/:/g,'":');
                    var settingsObject = JSON.parse(settingsString);
                    var listItemElement = angular.element(tElement.children().children().children().children().children());
                    if (Object.keys(settingsObject).length ==3) {
                        listItemElement.addClass('md-3-line');
                    }else{
                        listItemElement.addClass('md-2-line');
                    }
                    return {
                        post: function(scope,element,attrs){
                            scope.setImagen = {show:false};
                            scope.setIcon = {show:false};

                            //Variables de iconSettings
                            var iconKey = '',
                            iconCondition = '',
                            iconStyle = {},
                            iconName = '',
                            iconIsSet = false,
                            iconShow = false,
                            numberOfConditions = 0,
                            iconConfigPosition = 0,
                            iconConfigType ='',
                            iconIntervalMode = '',
                            iconConfig = [
                                {
                                    'style':{'color':'#00c853'},
                                    'name':'check_circle'
                                },
                                {
                                    'style': {'color':'#fdd835'},
                                    'name': 'warning'
                                },
                                {
                                    'style': {'color':'#d50000'},
                                    'name': 'remove_circle'
                                }

                            ];
                            
                            //define si existe una clave switch
                            if (scope.claveSwitch) {
                                var switchKey = Object.keys(scope.claveSwitch)[0];
                                var switchValue = scope.claveSwitch[switchKey];
                            }

                            //Si se pasa iconSettings no considera el atributo icon
                            if (attrs.iconSettings) {
                                iconIsSet = true;
                                iconShow = true;
                                iconKey = Object.keys(scope.iconSettings)[0];
                                numberOfConditions = scope.iconSettings[iconKey].items.length;
                                iconConfigType = scope.iconSettings[iconKey].type;
                                iconIntervalMode = scope.iconSettings[iconKey].mode;
                                if (numberOfConditions==2 && iconConfigType == 'value') {
                                    iconConfig.splice(1,1);
                                }else if(numberOfConditions==1 && iconConfigType=='interval'){
                                    iconConfig.splice(1,1);
                                }
                            }else if (typeof attrs.icon != 'undefined') {
                                scope.setIcon.show = true;
                                scope.setIcon.name = scope.icon;
                            }

                            scope.showSwitch = typeof attrs.switchFunction != 'undefined' ? true : false;

                            var setResourceList = attrs.foreignList ? true : false;
                            var dataLoadIsCompleted = false;
                            var resourceListCompleted = false;
                            var beginDataConfig = false;

                            if(setResourceList){
                                scope.resourceList = new Object();
                                angular.forEach(scope.foreignList, function(val, key){
                                    scope.resourceList[key] = DML.get(val).list;
                                    scope.$watchCollection('resourceList.' + key, function(nv){
                                        if (nv.$resolved) {
                                            var allresolved = true;
                                            angular.forEach(scope.resourceList, function(val2){
                                                if(!val2.$resolved){
                                                    allresolved = false;
                                                }
                                            });
                                            if(allresolved){
                                                resourceListCompleted = true;
                                                if (dataLoadIsCompleted) {
                                                    configureData(scope.data);
                                                }
                                            }
                                        }
                                    });
                                });
                            }

                            scope.$watchCollection('data', function(newData){
                                if (newData && newData.length>0) {
                                    if (!setResourceList) {
                                        configureData(newData);
                                    }else{
                                        dataLoadIsCompleted = true;
                                        if(resourceListCompleted){
                                            configureData(newData);
                                        }
                                    }
                                }
                            });

                            scope.isolateListFunction = function($event, key, item){
                                var returnObject = scope.data[key];
                                scope.listFunction({'ev':$event, 'value': returnObject});
                            };

                            scope.isolateSwitchFunction = function(state,key,item){
                                var returnObject = scope.data[key];
                                scope.switchFunction({state:state,item:returnObject});

                            };

                            function configureData(originalData){
                                var newData = angular.copy(originalData);
                                scope.downloadFields = {};
                                scope.downloadData = [];
                                scope.downloadData = newData;
                                angular.forEach(newData[0],function(val,key){
                                    scope.downloadFields[key] = key;
                                });
                                scope.listData = [];
                                scope.switchList = [];
                                angular.forEach(newData, function(value,key){
                                    //Configuracion de resources
                                    if (setResourceList) {
                                        angular.forEach(scope.resourceList, function(val2, key2){
                                            value[key2] = DML.getItemFromList({id:value[key2]}, val2).nombre;
                                        });
                                    }
                                    var listElement={};
                                    angular.forEach(scope.settings, function(dataKey,listKey){
                                        if (listKey=='avatar') {
                                            dataItem = setData.getUrlBlob(value[dataKey]);
                                            scope.setImagen.show = true;
                                        }else{
                                            var dataItem = value[dataKey];
                                        }
                                        if (listKey=='paragrafo2') {
                                            scope.mostrarParagrafo2=true;
                                        }
                                        listElement[listKey]=dataItem;
                                    });
                                    //Configura el icono de los items de la lista
                                    if (iconIsSet){
                                        var iconCondition = value[iconKey];
                                        if(iconConfigType=='value'){
                                            angular.forEach(scope.iconSettings[iconKey].items,function(val,key){
                                                if (val==iconCondition) {
                                                    iconConfigPosition = key;
                                                }
                                            });
                                        }else if(iconConfigType=='interval'){
                                            iconConfigPosition = iconIntervalMode=='up' ? 0 : numberOfConditions;
                                            var iconPositionIsSet = false;
                                            angular.forEach(scope.iconSettings[iconKey].items,function(val,key){
                                                if (iconCondition<val && !iconPositionIsSet) {
                                                    iconPositionIsSet = true;
                                                    iconConfigPosition = iconIntervalMode=='up' ? numberOfConditions - key : key;
                                                }
                                            });
                                        }
                                        listElement.icon = iconConfig[iconConfigPosition];
                                        listElement.icon.show = true;
                                    }
                                    else if(scope.setIcon.show) {
                                        listElement.icon = {
                                            'name':scope.setIcon.name,
                                            'show': scope.setIcon.show
                                        };
                                    }
                                    scope.listData.push(listElement);

                                    if (value[switchKey] == switchValue && scope.showSwitch) {
                                        scope.switchList.push(true);
                                    }else{
                                        scope.switchList.push(false);
                                    }    
                                });
                            }
                        }
                    }
                }
            }
        }])
        .directive('plotCard',['dtURL','plot',function(dtURL,plot){
            return {
                restrict:'E',
                scope:{
                    titulo:'@',
                    subtitulo:'@',
                    data:'=',
                    options:'=',
                    tipo:'@',
                    x:'=',
                    y:'=',
                    series:'='
                },
                templateUrl:dtURL+'plotcard.html',
                compile:function(cElem, cAttrs){
                    var tooltipValue = 'left';
                    if (cAttrs.tooltip) {
                        tooltipValue = cAttrs.tooltip;
                    }

                    var downloadButton = angular.element(cElem[0].querySelector('#download-button'));
                    downloadButton.attr('md-tooltip',tooltipValue);

                    return { 
                        post:function(scope,element, attrs){
                            if ('downloadData' in attrs){ 
                                scope.showDownload = true;
                            }
                            element.addClass('layout-column');

                            //Configura la opcion por defecto
                            scope.tipo = attrs.tipo ? scope.tipo : 'bar';

                            var dataIsResource = scope.data && '$promise' in scope.data ? true:false;

                            if (dataIsResource) {
                                scope.data.$promise.then(function(responseData){
                                        configPlotData(responseData);
                                });
                            }else{
                                scope.$watch('data',function(newData){
                                    if (newData && newData.length>0) {
                                        configPlotData(newData);
                                    }
                                });
                            }
                            

                            function configPlotData(responseData){
                                if(scope.series){
                                    var seriesKey = Object.keys(scope.series)[0],
                                    seriesIsPromise = '$promise' in scope.series[seriesKey] ? true : false;

                                    if(seriesIsPromise){
                                        scope.series[seriesKey].$promise.then(function(response){
                                            var seriesObject = {};
                                            seriesObject[seriesKey] = response;
                                            scope.isolateData = setPlotObject(responseData, seriesObject);
                                        });
                                    }else{
                                        scope.isolateData = setPlotObject(responseData, scope.series);
                                    }        
                                }else{
                                    scope.isolateData = setPlotObject(responseData);
                                }    
                            }

                            function setPlotObject(responseData, series=null){
                                var plotSettings={
                                   data:responseData, 
                                   options:scope.options,
                                   tipo:scope.tipo,
                                   filename:scope.titulo,
                                   axis:{x:scope.x,y:scope.y}
                                };
                                plotSettings.axis.series = series;
                                if(typeof attrs.offLegends != 'undefined'){
                                    scope.$on('chart-create',function(ev,thisChart){
                                        thisChart.config.data.datasets.forEach(function(ds) {
                                           ds.hidden = !ds.hidden;
                                        });
                                        thisChart.update();
                                    });
                                }
                                return plot.get(plotSettings);
                            }
                        }
                    }
                }
            }
        }])
        .directive('gridCard',function(dtURL,setData){
            return {
                restrict:'E',
                scope:{
                    titulo:'@',
                    subtitulo:'@',
                    tileFunction:'&',
                    data:'=',
                    settings:'=',
                    columnas:'@'
                },
                templateUrl:dtURL+'gridcard.html',
                link:function(scope,element,attrs){
                    var dataItem = '';
                    scope.$watchCollection('data', function(newData){
                        if (newData && newData.length > 0) {
                            if(scope.columnas){
                                scope.gridColumns = scope.columnas;
                            }else{
                                scope.gridColumns = 5;
                            }

                            scope.gridData=[];
                            angular.forEach(newData, function(value,key){
                                var gridElement={};
                                angular.forEach(scope.settings, function(dataKey,gridKey){
                                    if (gridKey=='avatar') {
                                        dataItem = setData.getUrlBlob(value[dataKey]);
                                    }else{
                                        if (gridKey!='header') {
                                            dataItem = dataKey + ': ' + value[dataKey];
                                        }else{
                                            dataItem = value[dataKey];
                                        }
                                    }
                                    gridElement[gridKey]=dataItem;
                                });
                                scope.gridData.push(gridElement);
                            });
                        }
                    });

                    scope.isolateFunction=function(key,ev,$scope){
                        scope.tileFunction({item:{key:key,value:scope.data[key]},ev:ev});
                    };
                }
            }
        })
        .directive('scrollButton', function ($timeout) {
            return {
                restrict: 'A',
                scope: {
                    scroll: "<"
                },
                link: function (scope, element) {
                    scope.$watchCollection('scrollBottom', function (newValue) {
                        if (newValue)
                        {
                            element.context.scrollTop =  element.context.scrollHeight;
                        }
                    });
                }
            }
        })
        .directive('formInput', ['dtURL', function (dtURL) {
            return {
                restrict: 'E',
                scope:{
                    value:'=',
                    label:'@',
                    tipo:'@',
                    name:'@',
                    form:'='
                },
                templateUrl:dtURL+'forminput.html',
                compile:function(tElement, tAttrs){
                    var inputElement = angular.element(tElement[0].querySelector('#input-element')),
                    textArea = angular.element(tElement[0].querySelector('#text-area'));
                    
                    if (typeof tAttrs.required == 'undefined') {    
                        inputElement.removeAttr('required');
                        textArea.removeAttr('required');
                    }

                    if (typeof tAttrs.caracteres!= 'undefined') {
                        textArea.attr('md-maxlength',tAttrs.caracteres);
                    }

                    if(tAttrs.tipo == 'number'){
                        inputElement.attr('min',0);
                    }

                    return{
                        post: function (scope, element, attrs) {
                            scope.showTextArea= scope.tipo == 'text-area' ? true : false;
                            scope.nameArea = scope.name + 'Area';
                            scope.nameInput = scope.name+ 'Input';
                            scope.setValue = function(value){
                                scope.value = value;
                            };
                        }
                    }
                }
            };
        }])
        .directive('formSelect', ['dtURL', function (dtURL) {
            return {
                restrict: 'E',
                scope:{
                    label:'@',
                    value:'=',
                    changeFunction:'&',
                    trackBy:'@',
                    options:'=',
                    showField:'@',
                    name:'@',
                    form:'=',
                    disabled:'=',
                    returnField:'@'
                },
                templateUrl:dtURL+'formselect.html',

                compile:function(tElement, tAttrs){
                    var selectElement = angular.element(tElement.children().children().children()[1]);
                    if (typeof tAttrs.required == 'undefined') {
                        selectElement.removeAttr('required');
                    }

                    if (typeof tAttrs.multiple == 'undefined') {
                        selectElement.removeAttr('multiple');
                    }

                    return{
                        post: function (scope, element, attrs) {
                            scope.firstValue = true;
                            if (!scope.value) {
                                scope.isolateValue= typeof attrs.returnField == 'undefined' ? {id:-1} : -1;
                            }else{
                                scope.isolateValue = scope.value;
                            }

                            scope.$watch('isolateValue',function(nv,ov,scp){
                                var idValue = angular.isObject(nv) ? nv.id : nv;
                                if(idValue!=-1 || nv!=ov){
                                    if (typeof attrs.returnField == 'undefined') {
                                        scope.value = nv;
                                    }else{
                                        if (angular.isArray(nv)) {
                                            var returnValue = [];
                                            angular.forEach(nv, function(val){
                                                returnValue.push(val[scope.returnField]);
                                            });
                                        }else{
                                            if(nv){
                                                var returnValue = nv[scope.returnField];
                                            }
                                            
                                        }
                                        scope.value = returnValue;
                                    }
                                }
                            });

                             scope.$watch('value',function(nv,ov){
                                var idValue = angular.isObject(nv) ? nv.id : nv;
                                if (idValue != -1 && scope.firstValue) {
                                    scope.firstValue = false;
                                    scope.isolateValue = nv;
                                }
                            });
                            
                            //Si esta configurado multiple, cada vez que se carga una nueva lista, 
                            //los datos seleccionados de la lista anterior se guardan en la variable value
                            if (typeof attrs.multiple != 'undefined') {
                                scope.$watch('options', function(nv,ov){            
                                    scope.value = scope.isolateValue;
                                });
                            }
                        }
                    }
                }
            };
        }])

        .directive('uploadFile', ['dtURL','Upload','dialog',function (dtURL,Upload,dialog) {
            return {
                restrict: 'E',
                scope:{
                    aditionalData:'&'
                },
                templateUrl:dtURL+'uploadfile.html',
                link: function (scope, iElement, iAttrs) {
                    scope.files = [];
                    scope.uploadFiles=function(files){
                        if(files.length > 0){
                            scope.data = scope.aditionalData();
                            angular.forEach(files, function(value, key){
                                scope.files.push(value);    
                            });
                            
                        }
                    };

                    scope.sendFiles=function(){
                        if(scope.files.length > 0){                     
                            scope.showProgress = true;
                            Upload.upload({
                                url:'?option=com_adminapp&task=adminapp.uploadfiles&format=JSON',
                                file: scope.files,
                                data: scope.data
                            }).then(function(response){
                                dialog.close();
                                scope.files = [];
                                scope.showProgress = false;
                            },function(error){
                                a=0;
                            },function(evt){
                                scope.progress = parseInt(100 * evt.loaded / evt.total);
                            });
                        }
                    };

                    scope.deleteFile = function(fileKey){
                        scope.files.splice(fileKey,1);
                        scope.fileToDelete="";
                    };
                }
            };
        }])
        .directive('cardListDense', ['dtURL',function (dtURL) {
            return {
                restrict: 'E',
                templateUrl:dtURL + 'cardlistdense.html',
                scope:{
                    titulo:'@',
                    icono:'@',
                    data:'=',
                    settings:'=',
                    iconType:'=',
                    columnas:'@'
                },
                transclude:{
                    'headContent':'?headContent'
                },
                compile: function(element, attrs){
                    
                    var icon = angular.element(element[0].querySelector('#icon'));
                    
                    if (attrs.iconType=='material-icons') {
                        icon.attr('md-icon-font',attrs.iconType)
                    }else if(attrs.iconType=='svg'){
                        icon.attr('md-svg-icon',attrs.icono);
                    }

                    return {
                        post: function (scope, iElement, iAttrs) {
                            iElement.addClass('layout-column');

                            scope.$watch('columnas',function(nd){
                                scope.flexGtMd = Math.round(100 / scope.columnas);
                            });

                            scope.$watchCollection('data', function(newData){
                                scope.isolateList=[];
                                angular.forEach(newData, function(value,key){
                                    var listElement={};
                                    angular.forEach(scope.settings, function(dataKey,gridKey){
                                        var dataItem = value[dataKey];
                                        listElement[gridKey]=dataItem;
                                    });
                                    scope.isolateList.push(listElement);
                                });
                            });
                        }
                    }
                }
            };
        }])
        .directive('buttonList', ['dtURL',function (dtURL) {
            return {
                scope:{
                    data:'=',
                    settings:'=',
                    function:'&'
                },
                restrict: 'E',
                templateUrl:dtURL + 'buttonlist.html',
                link: function (scope, iElement, iAttrs) {
                    scope.isolateList = [];
                    iElement.addClass('inherit-opacity');
                    angular.forEach(scope.data, function(value,key){
                        var listElement={};
                        angular.forEach(scope.settings, function(dataKey,listKey){
                            var dataItem = value[dataKey];
                            listElement[listKey]=dataItem;
                        });
                        scope.isolateList.push(listElement);
                    });
                }
            };
        }])
        .directive('bellow',['dtURL','$animate','$document', function(dtURL,$animate,$document){
            return{
                link:function(scope,element,attrs,ctrl,transclude){
                    var heightIsSet = false, baseAnimate, buttonAnimate,vanishAnimate;
                    var transcludeHeight = 0;

                    scope.isolateButtonClass = {
                        rotate:'',
                        value:true
                    };
                    scope.tooltipView = false;

                    scope.baseSpan = angular.element(element[0].querySelector('#base'));
                    scope.vanishSpan = angular.element(element[0].querySelector('#vanish'));
                    scope.buttonSpan = angular.element(element[0].querySelector('#button'));
                    //Eliminar el padding del subheader  
                    var subheader = angular.element(element[0].querySelector('#subheader')).children();
                    subheader.addClass('no-padding-top-bottom');
                    subheader.removeClass('md-subheader-inner');
                    
                    //Agregar estilos a bellow-content
                    scope.vanishSpan.children().addClass('inherit-opacity');
                    scope.vanishSpan.children().children().addClass('inherit-opacity');
                    $animate.addClass(scope.baseSpan,'grow');
                    $animate.addClass(scope.vanishSpan,'show');


                    scope.setDirective = function(){
                        if (!scope.isolateButtonClass.value) {
                            baseAnimate = $animate.addClass(scope.baseSpan,'grow',{from:{height:'0px'},to:{'height':setHeight() + 'px'}});
                            buttonAnimate = $animate.removeClass(scope.buttonSpan,'rotate');
                            vanishAnimate = $animate.addClass(scope.vanishSpan,'show');
                        }else{
                            baseAnimate = $animate.removeClass(scope.baseSpan,'grow', {from:{height:setHeight() + 'px'},to:{height:'0px'}});
                            buttonAnimate = $animate.addClass(scope.buttonSpan,'rotate');
                            vanishAnimate = $animate.removeClass(scope.vanishSpan,'show');
                        }
                        scope.isolateButtonClass.value = !scope.isolateButtonClass.value;
                    };
                   
                    function setHeight(){
                        if (!heightIsSet) {
                           transcludeHeight = scope.baseSpan[0].offsetHeight;
                           heightIsSet = true;
                        }

                        return transcludeHeight;
                    }
                },
                restrict:'E',
                scope:{
                    titulo:'@'
                },
                transclude:{
                    contenido: '?contenido'
                },
                templateUrl:dtURL + 'bellow.html'
            }
        }])
        .directive('dialogForm', ['$mdDialog','dtURL', 'forms', '$animate', function($mdDialog,dtURL,forms,$animate){
            return {
                // name: '',
                // priority: 1,
                // terminal: true,
                scope: {
                    titulo: '@',
                    funcionSubmit:'&',
                    nombreForm:'@'
                }, // {} = isolate, true = child, false/undefined = no change
                // controller: function($scope, $element, $attrs, $transclude) {},
                // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
                restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
                // template: '',
                templateUrl: dtURL + 'dialog-form.html',
                // replace: true,
                transclude: {
                    barButtons: '?buttons'
                },
                compile: function(tElement, tAttrs){
                    var formElement = tElement.children();
                    formElement.attr('name','innerFormObject');
                    return {
                        post:function(scope,element,attrs){
                            forms.setError({});
                            scope.error = forms.getError();

                            //Animacion del mensaje de error
                            scope.errorDiv = angular.element(element[0].querySelector('#errorMsg'));
                            

                            //Watch sobre el error
                            scope.$watch('error.detail',function(nv){
                                if (nv) {
                                    $animate.addClass(scope.errorDiv,'form-error',{from:{opacity:0},to:{opacity:1}});
                                }else{
                                    $animate.removeClass(scope.errorDiv,'form-error',{from:{opacity:1},to:{opacity:0}});
                                }
                            });
                            scope.closeDialog = function(){
                                $mdDialog.hide();
                            };

                        }
                    };
                }
            };
        }]);
    ;    
});

