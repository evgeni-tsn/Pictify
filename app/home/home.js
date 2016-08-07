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

            $scope.loginGoogle = function () {
                var promise = $kinvey.Social.connect(null, 'google', {redirect: 'http://localhost:8000'});
                console.log(promise);
                promise.then(function (user) {
                    alert("VADETE UQ -> " + user.username)
                }, function (err) {
                    alert("MAMKAMO OSRA SA -> " + err)
                    console.log(err)
                });
            }

            $scope.checkRegisterDetails = function (user) {
                authentication.registerUser(user);
            };

            let init = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    $rootScope.currentUser = Kinvey.getActiveUser();
                    if(!$rootScope.currentUser) {
                        console.log("No active user");
                    }
                });
            };

            init();
        }]);