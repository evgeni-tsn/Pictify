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
    'myApp.facebook',
    'ngSanitize',
    'infinite-scroll',
    'nya.bootstrap.select'
]);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    // $locationProvider.html5Mode(true);
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

app.controller('MainCtrl', ['$rootScope', '$scope', '$route', '$location', '$sce', '$kinvey', 'kinveyConfig', 'authentication',
    function ($rootScope, $scope, $route, $location, $sce, $kinvey, kinveyConfig, authentication) {
        $scope.$route = $route;

        kinveyConfig.authorize
        .then(function () {
            $rootScope.currentUser = $kinvey.getActiveUser();
            if (!$rootScope.currentUser) {
                console.log('no active user during maincontroller init');
                $location.path('/login');
                return;
            }

            $rootScope.initialized = true;

            // old way of fetching profile picture
            //     let promise = Kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
            //     promise.then(function (picture) {
            //         console.log(picture);
            //         $rootScope.profPic = picture;
            //     }, function (error) {
            //         console.log(error);
            // });

            $kinvey.User.get($rootScope.currentUser._id, {
                relations: {profilePicture: "pictures"}
            })
            .then(function (user) {
                console.log("fetched current user with embedded profile picture");
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
                    console.log(users);
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