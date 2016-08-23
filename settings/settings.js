'use strict';

angular.module('myApp.settings', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path('/login/'));
            }]
        };

        $routeProvider.when('/settings/', {
            templateUrl: 'settings/settings.html',
            controller: 'SettingsCtrl',
            activetab: 'settings',
            resolve: routeChecks.authenticated
        });
    }])

    .controller('SettingsCtrl', ['$rootScope', '$kinvey', '$scope', 'authentication',
        function ($rootScope, $kinvey, $scope, authentication) {

            $scope.changePassword = function (passwordDetails) {
                if (passwordDetails.newPassword != passwordDetails.repeatNewPassword) {
                    $scope.IsMatch = true;
                    return false;
                }
                $scope.IsMatch = false;
                authentication.changePassword(passwordDetails.newPassword);
            };

            $scope.setFullname = function (fullName) {
                authentication.changeFullName(fullName);
            }

        }]);