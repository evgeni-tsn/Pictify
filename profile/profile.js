'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl'
        });
    }])


    .controller('ProfileCtrl', ['$scope', '$kinvey', 'kinveyConfig', function ($scope, $kinvey, kinveyConfig) {
        $scope.pageName = "Profile Page";
        $scope.get = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                var image = document.getElementById('myImage');
                var promise = Kinvey.File.stream("23657fa6-cf2e-4619-991e-2db210368921");
                promise.then(function(file) {
                    var url = file._downloadURL;
                    image.setAttribute('src', url);
                });
            })
        }

        $scope.upload = function () {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                var fileContent = '"C:\\Users\\evgeni.tsn\\Desktop\\13815230_1328523720496005_1770185538_n.png"';
                var promise = $kinvey.File.upload(fileContent, {
                    mimeType  : 'image/png',
                    size      : fileContent.length
                });
                promise.then(function(response) {
                    console.log(response);
                }, function (err) {
                    console.log(err);
                });
            })
        }


    }]);