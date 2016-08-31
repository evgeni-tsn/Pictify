'use strict';

angular.module('pictifyApp.landing', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (!localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || !$rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path("/"));
            }]
        };

        $routeProvider.when('/login', {
            templateUrl: 'landing/landing.html',
            controller: 'LandingCtrl',
            activetab: 'landing',
            resolve: routeChecks.authenticated
        });
    }])

    .controller('LandingCtrl', ['$rootScope', '$scope', 'authentication', 'facebook',
        function ($rootScope, $scope, authentication, facebook) {

            $rootScope.initialized = true;

            $scope.login = function (user) {
                authentication.loginUser(user);
            };

            $scope.register = function (user) {
                if (user.password != user.repeatPassword) {
                    $scope.IsMatch = true;
                    return false;
                }
                $scope.IsMatch = false;
                authentication.registerUser(user);
            };

            $scope.loginFbk = function () {
                facebook.facebookLogin();
            };

            $scope.isRegistered = true;
            $scope.toggle = function () {
                $scope.isRegistered = !$scope.isRegistered;
            };
        }]);