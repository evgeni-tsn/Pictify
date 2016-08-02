'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home'
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig', '$window', '$location', '$route', 'authentication',
        function ($rootScope, $scope, $kinvey, kinveyConfig, $window, $location, $route, authentication) {
            $scope.pageName = "Login Page";

            $scope.login = function (user) {
                authentication.loginUser(user);
            };

            $scope.logout = function () {
                authentication.logout();
            };

            $scope.checkRegisterDetails = function (user) {
                authentication.registerUser(user);
            };

            let init = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    let user = Kinvey.getActiveUser();
                    if (user) {
                        $rootScope.currentUser = user;
                    } else {
                        $rootScope.currentUser = {};
                        $rootScope.currentUser.username = 'No active user';
                    }
                });
            };
            init();

        }]);