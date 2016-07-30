'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute',
  'kinvey',
  'myApp.login',
  'myApp.register',
  'myApp.profile',
  'myApp.version'
]);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/register'});
}]);

app.constant('kinveyConfig', {
  appKey: 'kid_BkwgJlt_',
  appSecret: 'f952632dff87441c82c8a0fefdc8c72f'
});