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
                var images = [];
                var user = Kinvey.getActiveUser();
                var query = new $kinvey.Query();
                query.equalTo('_acl.creator', user.id);
                var promise = $kinvey.File.find(query);
                promise.then(function (files) {
                    for (var i = 0, length = files.length; i < length; i += 1) {
                        var image = files[i];
                        images.push(image);
                        console.log(image);
                    }
                }, function (error) {
                    console.log(error)
                });

                $scope.images = images;
            })
        };

        $scope.fileSelect = function (files) {
            $scope.files = files;
        };

        $scope.upload = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                var user = Kinvey.getActiveUser();
                if (!user) {
                    console.log("No active user");
                    return;
                }

                var uploads = [];

                for (var i = 0, length = $scope.files.length; i < length; i += 1) {
                    var file = $scope.files[i];
                    uploads.push(Kinvey.File.upload(file, {
                        mimeType: "image/*",
                        size: file.size,
                        public: true,
                        isProfPic: false
                    }));
                }

                var promise = Kinvey.Defer.all(uploads);
                promise.then(function (response) {
                    console.log(response);
                }, function (error) {
                    console.log(error);
                });
            });
        };
    }]);