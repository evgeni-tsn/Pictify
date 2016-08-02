'use strict';

angular.module('myApp.login', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginCtrl'
        });
    }])

    .controller('LoginCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig', '$window',
        function ($rootScope, $scope, $kinvey, kinveyConfig, $window) {
            $scope.pageName = "Login Page";
            $scope.username = "";
            $scope.password = "";
            $scope.status = "";
            $scope.checkLoginDetails = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    var promise = $kinvey.User.login($scope.username, $scope.password);
                    promise.then(function (user) {
                        console.log("Successfully Logged In");
                        $scope.status = "Successfully Logged In";
                        console.log("Hello, your name is: " + user.username);
                        console.log(user);
                        $rootScope.currentUser = user;
                    }, function (err) {
                        console.log(err);
                        $scope.status = err.message;
                    });
                })
            };

            $scope.logout = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    var user = $kinvey.getActiveUser();
                    if (user !== null) {
                        var promise = $kinvey.User.logout();
                        promise.then(function () {
                            console.log("Successfully Logout");
                            $scope.status = "Successfully Logout";
                            $rootScope.currentUser = null;
                        }, function (err) {
                            console.log(err);
                            $scope.status = err.message;
                        });
                    }
                })
            }
        }]);