'use strict';

define(['routeResolver'],function(){

    var myApp = angular.module('materialApp', [
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
        'ngStorage']
    );
    return myApp;
});