/*Configuracion de la aplicacion*/

define(['myApp'],function(myApp){
    myApp
        .value('dtURL','https://cdn.jsdelivr.net/gh/cdcanasg/angularjs-material-resources@master/templates/')
        .value('DRFAPIDefinitions',global_api_definition)
    ;    
})
