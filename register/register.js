'use strict';

angular.module('myApp.register', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/register', {
            templateUrl: 'register/register.html',
            controller: 'RegisterCtrl'
        });
    }])

    .controller('RegisterCtrl', ['$scope', '$kinvey', 'kinveyConfig',
        function ($scope, $kinvey, kinveyConfig) {
            $scope.pageName = "Register Page";
            $scope.username = "";
            $scope.password = "";
            $scope.repeatPassword = "";

            $scope.status = "";

            $scope.checkRegisterDetails = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    let promise = $kinvey.User.signup({
                        username: $scope.username,
                        password: $scope.password
                    });
                    promise.then(function (user) {
                        console.log("Successfully Registered and Logged In");
                        console.log("Hello, your name is: " + user.username);
                        $scope.status = "Hello, your name is: " + user.username;
                        console.log(user)
                    }, function (err) {
                        console.log(err);
                        $scope.status = err.message;
                    });
                });
            };

            $scope.logout = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    let user = $kinvey.getActiveUser();
                    if (null !== user) {
                        let promise = $kinvey.User.logout();
                        promise.then(function () {
                            console.log("Successfully Logout");
                            $scope.status = "Successfully Logout";
                        }, function (err) {
                            console.log(err);
                            $scope.status = err.message;
                        });
                    }
                })
            }
        }]);