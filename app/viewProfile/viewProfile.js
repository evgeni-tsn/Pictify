'use strict';

angular.module('myApp.viewProfile', ['ngRoute'])

    .config(['$routeProvider' , function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    // if ($rootScope.selectedUserProxy) {
                        return $q.when(true);
                    // } else {
                    //     return $q.reject($location.path('/'));
                    // }
                }

                return $q.reject($location.path('/login/'));
            }]
        };

        $routeProvider.when('/view/:username', {
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

    .controller("ViewProfileCtrl", ["$rootScope", "$scope", "kinveyConfig", '$kinvey', '$routeParams', '$location', '$route',
        function ($rootScope, $scope, kinveyConfig, $kinvey, $routeParams, $location, $route) {
            $scope.getGallery = function () {
                kinveyConfig.authorize
                    .then(function () {
                        let query = new $kinvey.Query();
                        query.equalTo('_acl.creator', $scope.selectedUserProxy._id);

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
                        $kinvey.DataStore.update("pictures", {
                            _id: picture._id,
                            like: true
                        })
                            .then(function (response) {
                                console.log("liked picture");
                                console.log(response);
                                picture.votes.likes.push(response);

                            })
                    } else if (vote === "dislike") {
                        $kinvey.DataStore.update("pictures", {
                            _id: picture._id,
                            dislike: true
                        })
                            .then(function (response) {
                                console.log("disliked picture");
                                console.log(response);
                                picture.votes.dislikes.push(response);
                            })
                    }
                }
            };

            $scope.comment = function (picture, text) {
                $scope.commentBoxText = '';
                let promise = $kinvey.DataStore.update("pictures", {
                    _id: picture._id,
                    content: text
                });
                promise.then(function (response) {
                    console.log(response);
                    picture.comments.push(response);
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
                $kinvey.DataStore.get('socials', $scope.selectedUserProxy._id)
                    .then(function (social) {
                        $kinvey.DataStore.save('socials', social)
                            .then(function (success) {
                                console.log(success);
                            }, function (error) {
                                console.log(error);
                            });
                    });
            };

            $scope.showFollowers = function (user) {
                console.log(user);
                kinveyConfig.authorize
                    .then(function () {
                        $kinvey.DataStore.get("socials", user._id)
                            .then(function (social) {
                                let followersIds = [];

                                for (let followerId in social.followers) {
                                    followersIds.push(followerId);
                                }

                                let query = new $kinvey.Query();
                                query.equalTo("_id", {"$in": followersIds}).limit(20);

                                $kinvey.User.find(query, {
                                    relations: {profilePicture: "pictures"}
                                })
                                    .then(function (users) {
                                        $scope.selectedUserFollowers = users;
                                    }, function (error) {
                                        console.log(error);
                                    })
                            }, function (error) {
                                console.log(error);
                            })
                    })
            };

            $scope.showFollowing = function (user) {
                console.log(user);
                kinveyConfig.authorize
                    .then(function () {
                        $kinvey.DataStore.get("socials", user._id)
                            .then(function (social) {
                                let followersIds = [];

                                for (let followerId in social.following) {
                                    followersIds.push(followerId);
                                }

                                let query = new $kinvey.Query();
                                query.equalTo("_id", {"$in": followersIds}).limit(20);

                                $kinvey.User.find(query, {
                                    relations: {profilePicture: "pictures"}
                                })
                                    .then(function (users) {
                                        $scope.selectedUserFollowing = users;
                                    }, function (error) {
                                        console.log(error);
                                    })
                            }, function (error) {
                                console.log(error);
                            })
                    })
            };

            $scope.cleanFollowers = function () {
                $scope.selectedUserFollowers = [];
            };

            $scope.cleanFollowing = function () {
                $scope.selectedUserFollowing = [];
            };

            $scope.viewProfile = function (user) {
                $location.path('/view/' + user.username);
            };

            let init = function () {
                kinveyConfig.authorize
                    .then(function () {
                        console.log($routeParams.username);
                        let query = new $kinvey.Query();
                        query.equalTo('username', $routeParams.username).limit(1);

                        $kinvey.User.find(query, {
                            relations: {profilePicture: "pictures"}
                        }).then(function (userArr) {
                            let user = userArr[0];

                            if(!user) {
                                $scope.pageName = "User " + $routeParams.username + " does not exist";
                                return;
                            }
                            $scope.selectedUserProxy = user;
                            $scope.pageName = "Profile page of " + user.username;
                            $scope.getGallery();
                        }, function (error) {
                            console.log(error);
                        })
                    });
            };

            init();
        }]);