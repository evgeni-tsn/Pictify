'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('pictifyApp', [
    'ngRoute',
    'kinvey',
    'pictifyApp.home',
    'pictifyApp.landing',
    'pictifyApp.profile',
    'pictifyApp.viewProfile',
    'pictifyApp.settings',
    'pictifyApp.facebook',
    'pictifyApp.authentication',
    'ui.bootstrap',
    'ngAnimate',
    'mgcrea.ngStrap',
    'angular.filter',
    'ngImgCrop',
    'ngSanitize',
    'infinite-scroll',
    'nya.bootstrap.select',
    'angularMoment'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
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

app.controller('MainCtrl', ['$rootScope', '$scope', '$route', '$location', '$sce', '$kinvey', 'kinveyConfig', 'authentication',
    function ($rootScope, $scope, $route, $location, $sce, $kinvey, kinveyConfig, authentication) {
        $scope.$route = $route;

        kinveyConfig.authorize
            .then(function () {
                $rootScope.currentUser = $kinvey.getActiveUser();
                if (!$rootScope.currentUser) {
                    $location.path('/login');
                    return;
                }

                $rootScope.initialized = true;

                $kinvey.User.get($rootScope.currentUser._id, {
                    relations: {profilePicture: "pictures"}
                })
                    .then(function (user) {
                        $rootScope.currentUser = user;
                    }, function (error) {
                        console.log(error);
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

                    let query = new $kinvey.Query();
                    query.matches("username", regex).limit(15)
                        .or(new $kinvey.Query().matches('fullname', regex).limit(15));

                    return $kinvey.User.find(query, {
                        relations: {profilePicture: "pictures"}
                    })
                        .then(function (users) {
                                return users;
                            }, function (error) {
                                console.log(error);
                            }
                        )
                })
        };

        $scope.onSelect = function () {
            $location.path('/view/' + $scope.selectedUser.username);
            $route.reload();
        }
    }]);

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 1000);