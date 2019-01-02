/*Configuracion de la aplicacion*/

define(['myApp'],function(myApp){
    myApp
        .value('dtURL','static/' + global_app_owner + '/js/base/templates/')
        .value('DRFAPIDefinitions',global_api_definition)
    ;    
})
