'use strict';

define(['routeResolver'],function(){
    var base_angular_modules = [
        'ngMaterial',
        'ngMessages',
        'ngSanitize',
        'ngFileUpload',
        'ui.tinymce',
        'chart.js',
        'ngRoute',
        'firebase',
        'ngJsonExportExcel',
        'ngCookies',
        'ngResource',
        'routeResolverServices',
        'ngStorage'
    ];

    for (var i = angular_modules_additional.length - 1; i >= 0; i--) {
        base_angular_modules.push(angular_modules_additional[i]);
    }
    var myApp = angular.module('materialApp', base_angular_modules);
    return myApp;
});