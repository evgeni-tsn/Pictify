'use strict';

angular.module('myApp.viewProfile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewProfile', {
            templateUrl: 'viewProfile/viewProfile.html',
            controller: 'ViewProfileCtrl',
            activetab: 'viewProfile'
        });
    }])

    .controller("ViewProfileCtrl", ["$rootScope", "$scope", "kinveyConfig",
        function ($rootScope, $scope, kinveyConfig) {
            $scope.pageName = "Profile page of " + $scope.selectedUserProxy.username;

            $scope.getGallery = function () {
                kinveyConfig.authorize
                .then(function () {
                    let query = new Kinvey.Query();
                    query.equalTo('_acl.creator', $scope.selectedUserProxy._id);
                    let promise = Kinvey.DataStore.find("pictures", query);
                    promise.then(function (pictures) {
                        console.log("pictures in view profile gallery");
                        console.log(pictures);
                        $scope.pictures = pictures;
                    }, function (error) {
                        console.log(error)
                    })
                })
            };

            $scope.selectPic = function (picture) {
                if (!picture) {
                    console.log("No picture selected");
                }

                $scope.selectedPicture = picture;
            };

            $scope.vote = function (picture, vote) {
                let likes = picture.votes.likes;
                let dislikes = picture.votes.dislikes;
                let canVote = true;

                if (likes) {
                    for (let likeObj of likes) {
                        if (likeObj.userId === $rootScope.currentUser._id) {
                            canVote = false;
                        }
                    }
                } else {
                    likes = [];
                }

                if (dislikes) {
                    for (let dislikeObj of dislikes) {
                        if (dislikeObj.userId === $rootScope.currentUser._id) {
                            canVote = false;
                        }
                    }
                } else {
                    dislikes = [];
                }

                if (canVote) {
                    if (vote === "like") {
                        likes.push({
                            userId: $rootScope.currentUser._id,
                            username: $rootScope.currentUser.username
                        });
                    } else if (vote === "dislike") {
                        dislikes.push({
                            userId: $rootScope.currentUser._id,
                            username: $rootScope.currentUser.username
                        })
                    }

                    picture.votes.likes = likes;
                    picture.votes.dislikes = dislikes;
                    Kinvey.DataStore.update("pictures", picture)
                    .then(function (response) {
                        console.log("liked picture");
                        console.log(response);
                    })
                }
            };

            $scope.comment = function (picture, text) {
                picture.comments.push({
                    userId: $rootScope.currentUser._id,
                    username: $rootScope.currentUser.username,
                    content: text});
                let promise = Kinvey.DataStore.update("pictures", picture);
                promise.then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                })
            };

            let init = function () {
                kinveyConfig.authorize
                    .then(function () {
                    let promise = Kinvey.DataStore.get("pictures", $scope.selectedUserProxy.profile_picture);
                    promise.then(function (picture) {
                        $scope.userProfilePic = picture;

                        $scope.getGallery();
                    }, function (error) {
                        console.log(error);
                    })
                });
            };

            init();
    }]);