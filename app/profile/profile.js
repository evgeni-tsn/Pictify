'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        let routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path('/login/'));
            }]
        };

        $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl',
            activetab: 'profile',
            // Commented because bugs facebook login. Not loading properly.
            resolve: routeChecks.authenticated
        });
    }])

    .directive('fileChange', function () {
        return {
            restrict: 'A',
            scope: {
                handler: '&'
            },
            link: function (scope, element) {
                element.on('change', function (event) {
                    scope.$apply(function () {
                        scope.handler({files: event.target.files});
                    });
                });
            }
        };
    })

    .controller('ProfileCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig', '$location',
        function ($rootScope, $scope, $kinvey, kinveyConfig, $location) {
            $scope.pageName = "Profile Page";
            $scope.shouldCrop = false;
            $scope.imageForUpload = null;
            $scope.croppedImage = null;
            $scope.croppedImageBlob = null;
            $scope.selectedAlbum = null;
            $scope.showAll = true;

            $scope.saveNewAlbum = function (albumName) {
                console.log(albumName);
                kinveyConfig.authorize
                    .then(function () {
                        $kinvey.DataStore.save('albums', {
                            name: albumName,
                            _acl: {
                                gr:true
                            },
                            pictures: []
                        }).then(function (album) {
                            console.log(album)
                        }, function (error) {
                            console.log(error);
                        })
                    })
            };

            $scope.getGallery = function () {
                'use strict';
                kinveyConfig.authorize
                    .then(function () {
                        $scope.albums = [];

                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        if (!$scope.showAll) {
                            let query = new $kinvey.Query();
                            query.equalTo('_acl.creator', user._id);

                            let promise = $kinvey.DataStore.find("albums", query);
                            promise.then(function (albums) {
                                console.log(albums);

                                for(var album of albums) {
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
                                };
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

            // function containsFile(array, obj) {
            //     let i = array.length;
            //     while (i--) {
            //         if (array[i].name === obj.name) {
            //             return true;
            //         }
            //     }
            //     return false;
            // }

            $scope.showCrop = function () {
                if (!$scope.imageForUpload) {
                    $scope.shouldCrop = false;
                    $scope.croppedImage = null;
                    $scope.croppedImageBlob = null;
                    return $scope.shouldCrop;
                }

                $scope.shouldCrop = !$scope.shouldCrop;
            };

            $scope.fileSelect = function (files) {
                if (!$scope.imageForUpload) {
                    $scope.imageForUpload = {};
                }

                if (!files[0]) {
                    $scope.imageForUpload = null;
                    $scope.showCrop();
                    return;
                }

                if (files[0].type.match('image.*')) {
                    $scope.imageForUpload = files[0];
                }
            };

            $scope.upload = function () {
                kinveyConfig.authorize
                    .then(function () {
                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        if (!$scope.imageForUpload) {
                            console.log("No image to upload");
                            return;
                        }

                        let fileContent = null;

                        if (!$scope.shouldCrop) {
                            fileContent = $scope.imageForUpload;
                        } else {
                            fileContent = $scope.croppedImageBlob;
                            $scope.showCrop();
                        }

                        $kinvey.File.upload(fileContent, {
                            mimeType: fileContent.type,
                            size: fileContent.size,
                            _acl: {
                                gr: true,
                                gw: false
                            }
                        }, {public: true})
                            .then(function (response) {
                                console.log(response);
                                return response;
                            }, function (error) {
                                console.log(error);
                            })
                            .then(function (image) {
                                return $kinvey.DataStore.save('pictures', {
                                    image: {
                                        _type: 'KinveyFile',
                                        _id: image._id
                                    },
                                    _acl: {
                                        gr: true,
                                        gw: true
                                    },
                                    comments: [],
                                    votes: {
                                        likes: [],
                                        dislikes: []
                                    },
                                    caption: ''
                                })
                                    .then(function (success) {
                                        console.log(success);
                                        if ($scope.selectedAlbum) {
                                            let tempPicsIds = [];
                                            for (let picture of $scope.selectedAlbum.pictures) {
                                                tempPicsIds.push(picture._id);
                                            }

                                            $scope.selectedAlbum.pictures = tempPicsIds;
                                            $scope.selectedAlbum.pictures.push(success._id);

                                            $kinvey.DataStore.save('albums', $scope.selectedAlbum)
                                                .then(function (album) {
                                                    console.log(album);
                                                    $scope.getGallery();
                                                    $scope.selectedAlbum = null;
                                                }, function (error) {
                                                    console.log(error);
                                                })
                                        }
                                    }, function (error) {
                                        console.log(error);
                                    })
                            });


                        //// This handles multiple file uploads, but lacks cropping
                        // uploads.push()
                        //
                        // $scope.file.forEach(function (files) {
                        //     uploads.push(Kinvey.File.upload(files, {
                        //         mimeType: "image/*",
                        //         size: file.size,
                        //         public: true,
                        //     }));
                        // });

                        // let promise = Kinvey.Defer.all(uploads);
                        // promise.then(function (response) {
                        //     console.log(response);
                        // }, function (error) {
                        //     console.log(error);
                        // });
                    });
            };

            $scope.setProfilePic = function (picture) {
                kinveyConfig.authorize
                    .then(function () {
                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        if (!picture) {
                            console.log("No picture selected");
                            return;
                        }

                        user.profile_picture = picture._id;
                        user.profilePicture = {_id: picture._id};

                        $kinvey.User.update(user, {
                            exclude: ['profilePicture'],
                            relations: {profilePicture: "pictures"}
                        }).then(function () {
                            $kinvey.User.get(user._id, {
                                relations: {profilePicture: "pictures"}
                            }).then(function (user) {
                                $rootScope.currentUser = user;
                            })
                        });
                    });
            };

            $scope.selectPic = function (picture) {
                if (!picture) {
                    console.log("No picture selected");
                }

                $scope.selectedPicture = picture;
            };

            $scope.deletePic = function (picture) {
                kinveyConfig.authorize
                    .then(function () {
                        $rootScope.currentUser = $kinvey.getActiveUser();
                        if (!$rootScope.currentUser) {
                            console.log("No active user");
                            return;
                        }

                        if (!picture) {
                            console.log("No picture selected");
                            return;
                        }

                        $kinvey.File.destroy(picture.image._id);

                        var promise = $kinvey.DataStore.destroy("pictures", picture._id);
                        promise.then(function (success) {
                            console.log(success);
                        }, function (error) {
                            console.log(error);
                        });

                        $scope.pictures = $scope.pictures.filter(function (pic) {
                            return pic._id !== picture._id;
                        });
                    })
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
                console.log(user);
                $rootScope.selectedUserProxy = user;
                $rootScope.selectedUserProxy.profile_picture = user.profilePicture._id;
                $location.path('/view/' + user.username);
            };

            $scope.editCaption = function (picture, caption) {
                picture.caption = caption;
                $kinvey.DataStore.update("pictures", picture);
                $scope.editedCaption = '';
            };

            let init = function () {
                kinveyConfig.authorize.then(function () {
                    $scope.getGallery();

                    $kinvey.User.get($rootScope.currentUser._id, {
                        relations: {profilePicture: "pictures"}
                    })
                        .then(function (user) {
                            $rootScope.currentUser = user;
                        }, function (error) {
                            console.log(error);
                        });

                    // let promise = Kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
                    // promise.then(function (pic) {
                    //     $rootScope.profPic = pic;
                    //     console.log("fetched current user profile pic");
                    //     console.log($rootScope.profPic);
                    //
                    //     $scope.getGallery();
                    // }, function (error) {
                    //     console.log(error);
                    // })
                });
            };
            init();
        }]);