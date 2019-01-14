/*Configuracion de la aplicacion*/

define(['myApp'],function(myApp){
    myApp
        .value('dtURL', base_directive_templates)
        .value('DRFAPIDefinitions', global_api_definition)
    ;    
})
