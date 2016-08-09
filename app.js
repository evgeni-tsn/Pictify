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
    'angular.filter',
    'ngImgCrop',
    'myApp.facebook'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider, $kinveyConfig) {

    // 404
    $routeProvider.otherwise({redirectTo: '/'});
}]);

app.constant('kinveyConfig', {
    appKey: 'kid_BkwgJlt_',
    appSecret: 'f952632dff87441c82c8a0fefdc8c72f',
    authorize: Kinvey.init({
        appKey: 'kid_BkwgJlt_',
        appSecret: 'f952632dff87441c82c8a0fefdc8c72f'
    })
});

app.controller('MainCtrl', ['$rootScope', '$scope', '$route', 'kinveyConfig', function ($rootScope, $scope, $route, kinveyConfig) {
    $scope.$route = $route;

    kinveyConfig.authorize
        .then(function () {
        $rootScope.currentUser = Kinvey.getActiveUser();
        if(!$rootScope.currentUser) {
            console.log("No active user");
            return;
        }

        let query = new Kinvey.Query();
        let promise = Kinvey.File.stream($rootScope.currentUser.profile_picture);
        promise.then(function (image) {
            console.log(image);
            $rootScope.profPic = image;
        }, function (error) {
            console.log(error)
        });
    });
}]);