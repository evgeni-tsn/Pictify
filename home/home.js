'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        // there should be no route authorization here

        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path("/login"));
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

            let init = function () {
                kinveyConfig.authorize.then(function () {
                    $rootScope.currentUser = Kinvey.getActiveUser();

                    Kinvey.DataStore.get("socials", $rootScope.currentUser._id)
                        .then(function (response) {
                            console.log(response);

                            $scope.followedUsers = response.following;
                            for (var id in $scope.followedUsers) {
                                let idProxy = id;

                                $scope.followedUsers[idProxy] = {username: $scope.followedUsers[idProxy]};

                                Kinvey.User.get(idProxy)
                                    .then(function (user) {
                                        $scope.followedUsers[idProxy].followersCount = user.followersCount;
                                        $scope.followedUsers[idProxy]._id = idProxy;
                                        return user.profile_picture;
                                    }, function (error) {
                                        console.log(error);
                                    })
                                    .then(function (profPicId) {
                                        Kinvey.DataStore.get("pictures", profPicId)
                                            .then(function (profilePicture) {
                                                $scope.followedUsers[idProxy].profilePicture = profilePicture;
                                                console.log($scope.followedUsers);
                                            }, function (error) {
                                                console.log(error)
                                            })
                                    }, function (error) {
                                        console.log(error);
                                    })
                            }
                        }, function (error) {
                            console.log(error);
                        });
                });
            };

            init();
        }]);