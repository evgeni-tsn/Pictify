'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        let routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path('/login'));
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

    .controller('ProfileCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig',
        function ($rootScope, $scope, $kinvey, kinveyConfig) {
            $scope.pageName = "Profile Page";
            $scope.shouldCrop = false;
            $scope.imageForUpload = null;
            $scope.croppedImage = null;
            $scope.croppedImageBlob = null;

            // I don't agree this should be IIFE, sorry jak
            $scope.getGallery = function () {
                'use strict';
                kinveyConfig.authorize
                    .then(function () {
                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        let query = new Kinvey.Query();
                        query.equalTo('_acl.creator', user._id);
                        let promise = Kinvey.DataStore.find("pictures", query);
                        promise.then(function (pictures) {
                            console.log("fetched current user profile gallery");
                            console.log(pictures);
                            $scope.pictures = pictures;
                        }, function (error) {
                            console.log(error)
                        });
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

                        Kinvey.File.upload(fileContent, {
                            mimeType: fileContent.type,
                            size: fileContent.size,
                            _acl: {
                                gr: true,
                                gw: false
                            }
                        }, { public: true })
                        .then(function (response) {
                            console.log(response);
                            return response;
                        }, function (error) {
                            console.log(error);
                        })
                        .then(function (image) {
                            return Kinvey.DataStore.save('pictures', {
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
                                $scope.getGallery();
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

                        var promise = Kinvey.User.update(user);
                        promise.then(function (response) {
                            console.log(response);
                            $rootScope.profPic = picture;
                        }, function (error) {
                            console.log(error);
                        });
                    });
            };

            $scope.selectPic = function (picture) {
                // if (!$rootScope.currentUser) {
                //     console.log("No active user");
                //     return;
                // }

                if (!picture) {
                    console.log("No picture selected");
                }

                $scope.selectedImage = picture;
            };

            $scope.deletePic = function (picture) {
                kinveyConfig.authorize
                    .then(function () {
                        $rootScope.currentUser = Kinvey.getActiveUser();
                        if (!$rootScope.currentUser) {
                            console.log("No active user");
                            return;
                        }

                        if (!picture) {
                            console.log("No picture selected");
                            return;
                        }

                        Kinvey.File.destroy(picture.image._id);

                        var promise = Kinvey.DataStore.destroy("pictures", picture._id);
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

            $scope.editCaption = function (picture, caption) {
                picture.caption = caption;
                Kinvey.DataStore.update("pictures", picture);
            };

            let init = function () {
                kinveyConfig.authorize.then(function () {
                    let promise = Kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
                    promise.then(function (pic) {
                        $rootScope.profPic = pic;
                        console.log("fetched current user profile pic");
                        console.log($rootScope.profPic);

                        $scope.getGallery();
                    }, function (error) {
                        console.log(error);
                    })
                });
            };
            init();
        }]);