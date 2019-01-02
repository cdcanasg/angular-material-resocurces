var base_cdn_version = 'master';
var base_cdn = 'https://cdn.jsdelivr.net/gh/cdcanasg/angularjs-material-resources@' + base_cdn_version;
var global_api_definition = {};
global_api_definition[global_app_owner] = {
    'auth':{
        'login':null,
        'logout':null,
        'user':null,
    },
    'client':{
        'endpoints':null,
        'routers':null
    }
};

moment.locale('es');
require.config({
    baseUrl: 'static/' + global_app_owner + '/js',
    paths:{
        'angularChart':['base/angular.chart'],
        'angular':['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular'],
        'angularAnimate':['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-animate.min'],
        'angularAria': ['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-aria.min'],
        'angularMessages':['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-messages.min'],
        'angularSanitize': ['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize'],
        'angularRoute':['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route'],
        'angularCookies':['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-cookies'],
        'angularResource': ['//ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-resource'],
        'angularMaterial': ['//ajax.googleapis.com/ajax/libs/angular_material/1.1.9/angular-material'],
        'angularLocale': ['//cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.6.9/angular-locale_es-es'],
        'angularuirouter': ['//unpkg.com/@uirouter/angularjs/release/angular-ui-router.min'],
        'angularStorage': ['//cdnjs.cloudflare.com/ajax/libs/ngStorage/0.3.11/ngStorage'],
        'chartjs': ['//cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.0/Chart.bundle.min'],
        'firebase':['//www.gstatic.com/firebasejs/3.6.6/firebase'],
        'angularfire': ['//cdn.firebase.com/libs/angularfire/2.3.0/angularfire.min'],
        'ngFileUpload':[base_cdn + '/ng-file-upload'],
        'ngExportExcel': [base_cdn + '/json-export-excel'],
        'angular.tinymce': [base_cdn + '/angular.tinymce'],
        'routeResolver': [base_cdn + '/routeResolver'],
        'myApp': [base_cdn + '/angularmodule'],
        'config':[base_cdn + '/config'],
        'mainRoutes': ['routers/main'],
        'navbarcontroller': [base_cdn + '/navbarcontroller'],
        'myAppFactories': [base_cdn + '/angularfactories'],
        'myAppDirectives': [base_cdn + '/angulardirectives'],
        'latMenu': [base_cdn + '/latmenucontroller'],
        'myAppResource': [base_cdn + '/angularresources'],
        'myAppServices': [base_cdn + '/angularservices'],
        'pedigree': ['routers/pedigree'],
        'psp':['routers/psp'],
        'hemofilia':['routers/hemofilia'],
        'angioedema': ['routers/angioedema'],
        'lisosomal': ['routers/lisosomal'],
        'idp': ['routers/idp'],
        'shirecoord':['routers/shirecoord'],
        'shiremanager':['routers/shiremanager'],
        'deepmerge': [base_cdn + '/deepmerge'],
        'prototypes':[base_cdn + '/prototypes']
    },shim:{
        'angular':['prototypes'],
        'deepmerge':['angular'],
        'angularuirouter':['angular'],
        'angularAnimate':['angular'],
        'angularAria':['angular'],
        'angularMessages':['angular'],
        'angularSanitize' :['angular'],
        'angularRoute': ['angular'],
        'angularCookies' :['angular'],
        'angularResource' :['angular'],
        'angularMaterial' :['angular','angularAnimate','angularAria'],
        'angularStorage':['angular'],
        'angularLocale': ['angular'],
        'angularChart': ['angular', 'chartjs'],
        'angularfire': ['angular', 'firebase'],
        'ngFileUpload':['angular'],
        'ngExportExcel':['angular'],
        'angular.tinymce':['angular'],
        'routeResolver': ['angular'],
        'myApp': ['angularLocale','ngFileUpload','ngExportExcel','angular.tinymce','routeResolver','angularMaterial','angularMessages','angularSanitize','angularChart','angularRoute','angularfire','angularCookies','angularResource','angularStorage'],
        'appApiConfig':['myApp'],
        'config': ['appApiConfig'],
        'mainRoutes':['config'],
        'myAppServices': ['mainRoutes'],
        'myAppDirectives': ['myAppServices'],
        'myAppResource': ['myAppDirectives'],
        'myAppFactories': ['myAppResource'],
        'latMenu': ['myAppFactories'],
        'navbarcontroller': ['latMenu']
    }
});


require(['navbarcontroller'],function function3(){
    var cargando = document.getElementById('cargando-div');
    var nav_bar = document.getElementById('nav-bar-div');
    var lat_menu = document.getElementById('lat-menu-div');
    
    cargando.remove();
    nav_bar.style.visibility = 'visible';
    lat_menu.style.visibility = 'visible';

    angular.bootstrap(document, ['materialApp']);	
});