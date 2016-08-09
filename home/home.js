'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home'
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', '$http', '$kinvey', 'kinveyConfig',
        '$q', '$window', '$location', '$route', 'authentication', 'facebook',
        function ($rootScope, $scope, $http, $kinvey, kinveyConfig, $q, $window, $location, $route, authentication, facebook) {
            $scope.pageName = "Login Page";

            $scope.login = function (user) {
                authentication.loginUser(user);
            };

            $scope.logout = function () {
                authentication.logout();
            };

            $scope.checkRegisterDetails = function (user) {
                authentication.registerUser(user);
            };

            $scope.loginFbk = function () {

                facebook.getLoginStatus()
                    .then(function (authResponse) {
                    var provider = 'facebook';
                    var tokens = {
                        'access_token': authResponse.accessToken,
                        'expires_in': authResponse.expiresIn
                    };
                    return Kinvey.User.loginWithProvider(provider, tokens).then(null, function (err) {
                        // Attempt to signup as a new user if no user with the identity exists.
                        if (Kinvey.Error.USER_NOT_FOUND === err.name) {
                            return Kinvey.User.signupWithProvider(provider, tokens);
                        }
                        return Kinvey.Defer.reject(err);
                    });
                    })
                    .then(function (user) {

                        $scope.fbkFullname = user._socialIdentity.facebook.name;

                        facebook.getProfilePicture(user._socialIdentity.facebook.id)
                            .then(
                                function (response) {
                                    console.log(response);
                                    var getProfileUrl = response.data.url;
                                    facebook.updateUserInfo("profile_picture", getProfileUrl);
                                    console.log("Profile picture url gotted");

                                    //Extract from function
                                    $rootScope.currentUser = Kinvey.getActiveUser();
                                    let user = $rootScope.currentUser;
                                    console.log(user.profile_picture);
                                    $scope.fbkProfilePhotoShow = user.profile_picture;
                                }
                            )
                            .then(
                                function () {
                                    facebook.updateUserInfo("username", user._socialIdentity.facebook.id);
                                    console.log("Username updated with facebook id")
                                }
                            );
                    });
            };

            // $scope.loginGoogle = function () {
            //     var promise = $kinvey.Social.connect(null, 'google', {redirect: 'http://localhost:8000'});
            //     console.log(promise);
            //     promise.then(function (user) {
            //         alert("VADETE UQ -> " + user.username)
            //     }, function (err) {
            //         alert("MAMKAMO OSRA SA -> " + err);
            //         console.log(err)
            //     });
            // };

            // let init = function () {
            //     kinveyConfig.authorize.then(function () {
            //         $rootScope.currentUser = Kinvey.getActiveUser();
            //         if (!$rootScope.currentUser) {
            //             console.log("No active user");
            //         }
            //     });
            // };
            //
            // init();
        }]);