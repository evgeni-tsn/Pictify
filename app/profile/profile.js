'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl',
            activetab: 'profile'
        });
    }])

    .directive('fileChange', function() {
        return {
            restrict: 'A',
            scope: {
                handler: '&'
            },
            link: function (scope, element) {
                element.on('change', function (event) {
                    scope.$apply(function(){
                        scope.handler({files: event.target.files});
                    });
                });
            }
        };
    })

    .controller('ProfileCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig',
        function ($rootScope, $scope, $kinvey, kinveyConfig) {
        $scope.pageName = "Profile Page";

        $scope.get = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let images = [];
                let user = $rootScope.currentUser;
                if(!user) {
                    console.log("No active user");
                    return;
                }

                let query = new $kinvey.Query();
                query.equalTo('_acl.creator', user.id, 'mimeType', "image/*");
                let promise = $kinvey.File.find(query);
                promise.then(function (files) {
                    for (let file of files) {
                        images.push(file);
                        if(file._id === user.profile_picture) {
                            $rootScope.profPic = file;
                        }
                        console.log(file);
                    }
                }, function (error) {
                    console.log(error)
                });

                $scope.images = images;
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

        $scope.fileSelect = function (files) {
            if(!$scope.files) {
                $scope.files = [];
            }

            for(let file of files){
                if(file.type.match('image.*')) {
                    if (!containsFile($scope.files, file)) {
                        $scope.files.push(file);
                    }
                }
            }
        };

        $scope.upload = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let user = $rootScope.currentUser;
                if(!user) {
                    console.log("No active user");
                    return;
                }

                let uploads = [];

                $scope.files.forEach(function (file) {
                    uploads.push(Kinvey.File.upload(file, {
                        mimeType: "image/*",
                        size: file.size,
                        public: true,
                    }));
                });

                let promise = Kinvey.Defer.all(uploads);
                promise.then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            });
        };

        $scope.setProfilePic = function (image) {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let user = $rootScope.currentUser;
                if(!user) {
                    console.log("No active user");
                    return;
                }

                if(!image) {
                    console.log("No picture selected");
                    return;
                }

                user.profile_picture = image._id;

                var promise = Kinvey.User.update(user);
                promise.then(function(response) {
                    console.log(response);
                    $rootScope.profPic = image;
                }, function(error) {
                    console.log(error);
                });
            });
        };

        $scope.selectPic = function (image) {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                $rootScope.currentUser = Kinvey.getActiveUser();
                if(!$rootScope.currentUser) {
                    console.log("No active user");
                    return;
                }

                if(!image) {
                    console.log("No picture selected");
                }

                $scope.selectedImage = image;
            });
        };

        $scope.deletePic = function (image) {
          $kinvey.init({
              appKey: kinveyConfig.appKey,
              appSecret: kinveyConfig.appSecret
          }).then(function () {
              $rootScope.currentUser = Kinvey.getActiveUser();
              if(!$rootScope.currentUser) {
                  console.log("No active user");
                  return;
              }

              if(!image) {
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
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                $rootScope.currentUser = Kinvey.getActiveUser();
                if(!$rootScope.currentUser) {
                    console.log("No active user");
                    return;
                }

                $scope.get();
            });
        };
        init();
    }]);