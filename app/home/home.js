'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || $rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path("/login/"));
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
                            console.log(response.following);
                            $scope.followedUsers = [];
                            var followedUsersIds = [];

                            for (var id in response.following) {
                                let idProxy = id;

                                followedUsersIds.push(idProxy);
                            }

                            console.log(followedUsersIds);

                            let query = new Kinvey.Query();
                            query.equalTo("_id", {"$in":followedUsersIds});
                            console.log(query);

                            Kinvey.User.find(query)
                                .then(function (followedUsers) {
                                    console.log(followedUsers);
                                    for(let user of followedUsers) {
                                        Kinvey.DataStore.get("pictures", user.profile_picture)
                                            .then(function (picture) {
                                               user.profilePicture = picture;
                                               $scope.followedUsers.push(user);
                                            }, function (error) {
                                                console.log(error);
                                            });
                                    }
                                }, function (error) {
                                   console.log(error);
                                });
                        }, function (error) {
                            console.log(error);
                        });
                });
            };

            init();
        }]);