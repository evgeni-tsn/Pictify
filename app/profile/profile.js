'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl',
            activetab: 'profile'
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
            $scope.getAllPics = function () {
                'use strict';
                kinveyConfig.authorize
                    .then(function () {
                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        let query = new $kinvey.Query();
                        query.equalTo('_acl.creator', user.id /*, 'mimeType', "image/*"*/);
                        let promise = $kinvey.File.find(query);
                        promise.then(function (images) {
                            $scope.images = images;
                        }, function (error) {
                            console.log(error)
                        });
                    })
            };

            function containsFile(array, obj) {
                let i = array.length;
                while (i--) {
                    if (array[i].name === obj.name) {
                        return true;
                    }
                }
                return false;
            }

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

                        if (!$scope.shouldCrop) {
                            let promise = Kinvey.File.upload($scope.imageForUpload, {
                                mimeType: $scope.imageForUpload.type,
                                size: $scope.imageForUpload.size,
                                _acl: {
                                    gr: true
                                }
                            }, {public:true});
                            promise.then(function (response) {
                                console.log(response);
                                $scope.getAllPics();
                            }, function (error) {
                                console.log(error);
                            });
                        } else {
                            let fileContent = $scope.croppedImageBlob;
                            let promise = Kinvey.File.upload(fileContent, {
                                mimeType: "image/*",
                                size: fileContent.size,
                                _filename: "cropped_" + $scope.imageForUpload.name,
                                _acl: {
                                    gr: true
                                }
                            }, {public:true});
                            promise.then(function (response) {
                                console.log(response);
                                $scope.showCrop();
                                $scope.getAllPics();
                            }, function (error) {
                                console.log(error);
                            })
                        }


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

            $scope.setProfilePic = function (image) {
                kinveyConfig.authorize
                    .then(function () {
                        let user = $rootScope.currentUser;
                        if (!user) {
                            console.log("No active user");
                            return;
                        }

                        if (!image) {
                            console.log("No picture selected");
                            return;
                        }

                        user.profile_picture = image._id;

                        var promise = Kinvey.User.update(user);
                        promise.then(function (response) {
                            console.log(response);
                            $rootScope.profPic = image;
                        }, function (error) {
                            console.log(error);
                        });
                    });
            };

            $scope.selectPic = function (image) {
                        // if (!$rootScope.currentUser) {
                        //     console.log("No active user");
                        //     return;
                        // }

                        if (!image) {
                            console.log("No picture selected");
                        }

                        $scope.selectedImage = image;
                    };

            $scope.deletePic = function (image) {
                kinveyConfig.authorize
                    .then(function () {
                        $rootScope.currentUser = Kinvey.getActiveUser();
                        if (!$rootScope.currentUser) {
                            console.log("No active user");
                            return;
                        }

                        if (!image) {
                            console.log("No picture selected");
                            return;
                        }

                        var promise = Kinvey.File.destroy(image._id);
                        promise.then(function (success) {
                            console.log(success);
                        }, function (error) {
                            console.log(error);
                        });

                        $scope.images = $scope.images.filter(function (img) {
                            return img._id !== image._id;
                        });
                    })
            };

            let init = function () {
                kinveyConfig.authorize.then(function () {
                    $scope.getAllPics();
                });
            };
            init();
        }]);