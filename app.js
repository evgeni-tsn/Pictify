'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
    'ngRoute',
    'kinvey',
    'myApp.home',
    'myApp.profile',
    'myApp.version',
    'ui.bootstrap',
    'mgcrea.ngStrap',
    'myApp.authentication',
    'angular.filter'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

    // 404
    $routeProvider.otherwise({redirectTo: '/'});
}]);

app.constant('kinveyConfig', {
    appKey: 'kid_BkwgJlt_',
    appSecret: 'f952632dff87441c82c8a0fefdc8c72f'
});

app.controller('MainCtrl', ['$rootScope', '$scope', '$route', function ($rootScope, $scope, $route) {
    $scope.$route = $route;
}]);