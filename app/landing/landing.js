'use strict';

angular.module('myApp.landing', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'landing/landing.html',
            controller: 'LandingCtrl',
            activetab: 'landing'
        });
    }])

    .controller('LandingCtrl', ['$rootScope', '$scope', '$q', '$location', '$route', 'authentication', 'facebook',
        function ($rootScope, $scope, $q, $location, $route, authentication, facebook) {

            $scope.login = function (user) {
                authentication.loginUser(user);
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
                                    facebook.updateUserInfo("profile_picture_url", getProfileUrl);
                                    console.log("Profile picture url gotted");

                                    //Extract from function
                                    $rootScope.currentUser = Kinvey.getActiveUser();
                                    let user = $rootScope.currentUser;
                                    console.log(user.profile_picture_url);
                                    $rootScope.profPic = user.profile_picture_url;
                                }
                            )
                            .then(
                                function () {
                                    let rawFacebookName = user._socialIdentity.facebook.name;
                                    let facebookUsernameParts = rawFacebookName.toLowerCase().split(' ');
                                    let facebookUsernameReady = facebookUsernameParts.join(".");
                                    facebook.updateUserInfo("username", facebookUsernameReady);
                                    console.log("Username updated with facebook id")
                                }
                            )
                            .then(
                                $location.path("/profile")
                            );
                    });
            };

            $scope.isRegistered = true;
            $scope.toggle = function () {
                $scope.isRegistered = !$scope.isRegistered;
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
            //
            // let init = function () {
            //     kinveyConfig.authorize.then(function () {
            //         $rootScope.currentUser = Kinvey.getActiveUser();
            //         if (!$rootScope.currentUser) {
            //             console.log("No active user");
            //         }
            //
            //         let promise = Kinvey.File.stream($rootScope.currentUser.profile_picture);
            //         promise.then(function (image) {
            //             $rootScope.profPic = image;
            //         }, function (error) {
            //             console.log(error);
            //         })
            //     });
            // };
            //
            // init();
        }]);