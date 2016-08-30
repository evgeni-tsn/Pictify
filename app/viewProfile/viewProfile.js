'use strict';

angular.module('myApp.viewProfile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
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
                'use strict';
                kinveyConfig.authorize
                    .then(function () {
                        $scope.albums = [];

                        let user = $scope.selectedUserProxy;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        if (!$scope.showAll) {
                            let query = new $kinvey.Query();
                            query.equalTo('_acl.creator', user._id)
                                .descending('_kmd.lmt');
                            let promise = $kinvey.DataStore.find("albums", query);
                            promise.then(function (albums) {
                                console.log(albums);

                                for (var album of albums) {
                                    let albumProxy = album;
                                    let queryForPicsInAlbum = new $kinvey.Query();
                                    queryForPicsInAlbum.equalTo('_id', {'$in': albumProxy.pictures})
                                        .descending('_kmd.lmt');
                                    $kinvey.DataStore.find('pictures', queryForPicsInAlbum)
                                        .then(function (pictures) {
                                            albumProxy.pictures = pictures;
                                            console.log("fetched album " + albumProxy.name);
                                            console.log(albumProxy.pictures);
                                            $scope.albums.push(albumProxy);
                                            $scope.albums.sort(function(a,b){
                                                // Turn your strings into dates, and then subtract them
                                                // to get a value that is either negative, positive, or zero.
                                                return new Date(b._kmd.lmt) - new Date(a._kmd.lmt);
                                            });
                                        });
                                }
                                ;
                            }, function (error) {
                                console.log(error)
                            });
                        } else {
                            let query = new $kinvey.Query();
                            query.equalTo('_acl.creator', user._id)
                                .descending('_kmd.lmt');
                            let promise = $kinvey.DataStore.find("pictures", query);
                            promise.then(function (pictures) {
                                console.log("fetched current user profile gallery");
                                console.log(pictures);
                                $scope.pictures = pictures;
                            }, function (error) {
                                console.log(error)
                            });
                        }
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

            $scope.checkIsFollowed = function (user) {
                kinveyConfig.authorize
                    .then(function () {
                        $kinvey.DataStore.get("socials", $rootScope.currentUser._id)
                            .then(function (social) {
                                let followersIds = [];
                                for (let followerId in social.following) {
                                    followersIds.push(followerId);
                                }
                                console.log(user);
                                if (followersIds.indexOf(user._id) > -1) {
                                    $scope.followStatus = "Unfollow";

                                }
                                else {
                                    $scope.followStatus = "Follow";
                                }
                            }, function (error) {
                                console.log(error);
                            })
                    })
            };

            $scope.follow = function () {
                $kinvey.DataStore.get('socials', $scope.selectedUserProxy._id)
                    .then(function (social) {
                        console.log(social);
                        $kinvey.DataStore.save('socials', social)
                            .then(function (success) {
                                var currentStatus = $scope.followStatus;
                                if (currentStatus === "Follow") {
                                    $scope.followStatus = "Unfollow";
                                    $scope.selectedUserProxy.followersCount = $scope.selectedUserProxy.followersCount + 1;

                                } else {
                                    $scope.followStatus = "Follow";
                                    $scope.selectedUserProxy.followersCount = $scope.selectedUserProxy.followersCount - 1;
                                }
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

                            if (!user) {
                                $scope.pageName = "User " + $routeParams.username + " does not exist";
                                return;
                            }
                            $scope.selectedUserProxy = user;
                            $scope.pageName = "Profile page of " + user.username;
                            $scope.getGallery();
                            $scope.checkIsFollowed(user);
                        }, function (error) {
                            console.log(error);
                        })
                    });
            };

            init();
        }]);