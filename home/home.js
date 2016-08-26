'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path("/login/"));
            }]
        };

        $routeProvider.when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home',
            resolve: routeChecks.authenticated
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', 'kinveyConfig', '$location', '$route',
        function ($rootScope, $scope, kinveyConfig, $location, $route) {

            $scope.viewProfile = function (user) {
                console.log(user);
                $rootScope.selectedUserProxy = user;
                $rootScope.selectedUserProxy.profile_picture = user.profilePicture._id;
                $location.path('/viewProfile');
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
                    content: text
                });
                let promise = Kinvey.DataStore.update("pictures", picture);
                promise.then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                })
            };

            let init = function () {
                kinveyConfig.authorize.then(function () {
                    $rootScope.currentUser = Kinvey.getActiveUser();

                    Kinvey.DataStore.get("socials", $rootScope.currentUser._id)
                        .then(function (response) {
                            console.log(response);
                            console.log(response.following);
                            $scope.followedUsers = [];
                            var followedUsersIds = [];

                            for (var id in response.following) {
                                let idProxy = id;

                                followedUsersIds.push(idProxy);
                            }

                            console.log(followedUsersIds);

                            let query = new Kinvey.Query();
                            query.equalTo("_id", {"$in":followedUsersIds});

                            Kinvey.User.find(query, {
                                relations:{ profilePicture:"pictures" }
                            })
                                .then(function (followedUsers) {
                                    $scope.followedUsers = followedUsers;

                                    let queryForFeed = new Kinvey.Query();
                                    queryForFeed.equalTo('_acl.creator', {"$in": followedUsersIds})
                                        .descending("_kmd.lmt").limit(20);

                                    Kinvey.DataStore.find("pictures", queryForFeed)
                                        .then(function (pictures) {
                                            console.log(pictures);
                                            let newsFeed = [];
                                            for (var picture of pictures) {
                                                for(var user of $scope.followedUsers) {
                                                    if (user._id === picture._acl.creator) {
                                                        newsFeed.push({picture: picture, user: user});
                                                        break;
                                                    }
                                                }
                                            }

                                            $scope.newsFeed = newsFeed;
                                            console.log($scope.newsFeed);
                                        }, function (error) {
                                            console.log(error);
                                        })
                                }, function (error) {
                                   console.log(error);
                                });
                        }, function (error) {
                            console.log(error);
                        });
                });
            };

            init();
        }]);