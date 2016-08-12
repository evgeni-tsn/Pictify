'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home'
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', 'facebook',
        function ($rootScope, $scope, facebook) {

            $scope.msg = "This will be news feed.";


            // let init = function () {
            //     kinveyConfig.authorize.then(function () {
            //         $rootScope.currentUser = Kinvey.getActiveUser();
            //         if (!$rootScope.currentUser) {
            //             console.log("No active user");
            //         }
            //
            //         let promise = Kinvey.File.stream($rootScope.currentUser.profile_picture);
            //         promise.then(function (image) {
            //             $rootScope.profPic = image;
            //         }, function (error) {
            //             console.log(error);
            //         })
            //     });
            // };
            //
            // init();
        }]);