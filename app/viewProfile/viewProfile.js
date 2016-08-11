'use strict';

angular.module('myApp.viewProfile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewProfile', {
            templateUrl: 'viewProfile/viewProfile.html',
            controller: 'ViewProfileCtrl',
            activetab: 'viewProfile'
        });
    }])

    .controller("ViewProfileCtrl", ["$scope", "kinveyConfig",
        function ($scope, kinveyConfig) {
            $scope.pageName = "Profile page of " + $scope.selectedUser.username;

            $scope.getGallery = function () {
                kinveyConfig.authorize
                .then(function () {
                    let query = new Kinvey.Query();
                    query.equalTo('_acl.creator', $scope.selectedUser._id);
                    let promise = Kinvey.File.find(query);
                    promise.then(function (images) {
                        $scope.images = images;
                    }, function (error) {
                        console.log(error)
                    })
                })
            };

            $scope.selectPic = function (image) {
                if (!image) {
                    console.log("No picture selected");
                }

                $scope.selectedImage = image;
            };

            let init = function () {
                kinveyConfig.authorize
                    .then(function () {
                    let promise = Kinvey.File.stream($scope.selectedUser.profile_picture);
                    promise.then(function (image) {
                        $scope.userProfilePic = image;
                    }, function (error) {
                        console.log(error);
                    })
                });

                $scope.getGallery();
            };

            init();
    }]);