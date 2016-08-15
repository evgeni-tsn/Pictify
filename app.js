'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
    'ngRoute',
    'kinvey',
    'myApp.home',
    'myApp.landing',
    'myApp.profile',
    'myApp.viewProfile',
    'myApp.settings',
    'myApp.version',
    'ui.bootstrap',
    'ngAnimate',
    'mgcrea.ngStrap',
    'myApp.authentication',
    'angular.filter',
    'ngImgCrop',
    'myApp.facebook'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

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

app.controller('MainCtrl', ['$rootScope', '$scope', '$route', '$location', 'kinveyConfig', 'authentication',
    function ($rootScope, $scope, $route, $location, kinveyConfig, authentication) {
        $scope.$route = $route;

        kinveyConfig.authorize
        .then(function () {
            $rootScope.currentUser = Kinvey.getActiveUser();
            if (!$rootScope.currentUser) {
                console.log('no active user during maincontroller init');
                $location.path('/login');
                return;
            }

            $rootScope.initialized = true;

            let promise = Kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
            promise.then(function (picture) {
                console.log(picture);
                $rootScope.profPic = picture;
            }, function (error) {
                console.log(error)
        });
    });

    $scope.logout = function () {
        authentication.logout();
    };

    $scope.searchUsers = function (typed) {
        return kinveyConfig.authorize
        .then(function () {

            // Kinvey does not support ignore case regex due to performance issues
            let regex = "^" + typed + ".*$";

            let query = new Kinvey.Query();
            query.matches("username", regex);

            return Kinvey.User.find(query).then(function (users) {
                    console.log(users);
                    return users;
                }, function (error) {
                    console.log(error);
                }
            )
        })
    };

    $scope.selectedUserProxy = null;

    $scope.onSelect = function () {
        $scope.selectedUserProxy = $scope.selectedUser;
        $location.path('/viewProfile');
        $route.reload();
    }
}]);