'use strict';

angular.module('myApp.settings', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', function ($q, $location) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")) {
                    return $q.when(true);
                }

                return $q.reject($location.path('/login'));
            }]
        };

        $routeProvider.when('/settings', {
            templateUrl: 'settings/settings.html',
            controller: 'SettingsCtrl',
            activetab: 'settings',
            resolve: routeChecks.authenticated
        });
    }])

    .controller('SettingsCtrl', ['$rootScope', '$kinvey', '$scope', 'authentication',
        function ($rootScope, $kinvey, $scope, authentication) {

            $scope.oldPassword = "";
            $scope.newPassword = "";
            $scope.RepeatNewPassword = "";

            $scope.changePassword = function () {
                authentication.changePassword($scope.newPassword);
            }
        }]);