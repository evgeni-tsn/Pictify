'use strict';

angular.module('myApp.settings', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', 'authentication', function ($q, authentication) {
                if (authentication.isLogged()) {
                    return $q.when(true);
                }

                return $q.reject('Unauthorized Access');
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