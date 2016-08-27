'use strict';

angular.module('myApp.viewProfile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    if ($rootScope.selectedUserProxy) {
                        return $q.when(true);
                    } else {
                        return $q.reject($location.path('/'));
                    }
                }

                return $q.reject($location.path('/login/'));
            }]
        };

        $routeProvider.when('/viewProfile', {
            templateUrl: 'viewProfile/viewProfile.html',
            controller: 'ViewProfileCtrl',
            activetab: 'viewProfile',
            resolve: routeChecks.authenticated
        });

        // $routeProvider.when('/viewProfile:userName', {
        //     templateUrl: 'viewProfile/viewProfile.html',
        //     controller: 'ViewProfileCtrl',
        //     activetab: 'viewProfile',
        //     resolve: routeChecks.authenticated
        // });
    }])

    .controller("ViewProfileCtrl", ["$rootScope", "$scope", "kinveyConfig", '$kinvey', '$routeParams', '$location',
        function ($rootScope, $scope, kinveyConfig, $kinvey, $routeParams, $location) {
            $scope.pageName = "Profile page of " + $rootScope.selectedUserProxy.username;
            $scope.getGallery = function () {
                kinveyConfig.authorize
                    .then(function () {
                        let query = new $kinvey.Query();
                        query.equalTo('_acl.creator', $rootScope.selectedUserProxy._id);

                        let promise = $kinvey.DataStore.find("pictures", query);
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
                    $kinvey.DataStore.update("pictures", picture)
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
                    content: text
                });
                let promise = $kinvey.DataStore.update("pictures", picture);
                promise.then(function (response) {
                    console.log(response);
                    $scope.commentBoxText = '';
                }, function (error) {
                    console.log(error);
                })
            };

            $scope.testDelete = function (picture) {
                let promise = $kinvey.DataStore.destroy("pictures", picture._id);
                promise.then(function (success) {
                    console.log(success);
                }, function (error) {
                    console.log(error);
                })
            };

            $scope.follow = function () {
                $kinvey.DataStore.get('socials', $rootScope.selectedUserProxy._id)
                    .then(function (social) {
                        $kinvey.DataStore.save('socials', social)
                            .then(function (success) {
                                console.log(success);
                            }, function (error) {
                                console.log(error);
                            });
                    });
            };

            let init = function () {
                kinveyConfig.authorize
                    .then(function () {
                        let promise = $kinvey.DataStore.get("pictures", $rootScope.selectedUserProxy.profile_picture);
                        promise.then(function (picture) {
                            $scope.userProfilePic = picture;
                            $scope.getGallery();
                        }, function (error) {
                            console.log(error);
                        });

                        $kinvey.DataStore.get("socials", $rootScope.currentUser._id)
                            .then(function (response) {

                            }, function (error) {

                            })
                    });
            };

            init();
        }]);