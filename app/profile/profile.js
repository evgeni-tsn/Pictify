'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl'
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

    .controller('ProfileCtrl', ['$scope', '$kinvey', 'kinveyConfig', function ($scope, $kinvey, kinveyConfig) {
        $scope.pageName = "Profile Page";

        $scope.get = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let images = [];
                let user = Kinvey.getActiveUser();
                if(!user) {
                    console.log("No active user");
                    return;
                }
                let query = new $kinvey.Query();
                query.equalTo('_acl.creator', user.id, 'mimeType', "image/*");
                let promise = $kinvey.File.find(query);
                promise.then(function (files) {
                    if(files.length > 1) {
                        files.forEach(function (file) {
                            images.push(file);
                            console.log(file);
                        })
                    } else if(files.length === 1) {
                        images.push(files[0]);
                        console.log(files[0]);
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
                let user = Kinvey.getActiveUser();
                if (!user) {
                    console.log("No active user");
                    return;
                }

                let uploads = [];

                $scope.files.forEach(function (file) {
                    uploads.push(Kinvey.File.upload(file, {
                        mimeType: "image/*",
                        size: file.size,
                        public: true,
                        isProfPic: false
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
    }]);