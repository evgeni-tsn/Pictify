'use strict';

angular.module('myApp.landing', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        var routeChecks = {
            authenticated: ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
                if (!localStorage.getItem("Kinvey.kid_BkwgJlt_.activeUser")
                    || !$rootScope.currentUser) {
                    return $q.when(true);
                }

                return $q.reject($location.path("/"));
            }]
        };

        $routeProvider.when('/login', {
            templateUrl: 'landing/landing.html',
            controller: 'LandingCtrl',
            activetab: 'landing',
            // Commented because on logout creates problem with routes.
            resolve: routeChecks.authenticated
        });
    }])

    .controller('LandingCtrl', ['$rootScope', '$scope', '$q',
                                '$location', '$route', '$http',
                                'authentication', 'facebook', 'kinveyConfig',
        function ($rootScope, $scope, $q,
                  $location, $route, $http,
                  authentication, facebook, kinveyConfig) {

            $rootScope.initialized = true;

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
                        return Kinvey.User.loginWithProvider(provider, tokens).then(
                        function (success) {
                            console.log("successful login with facebook");

                            $rootScope.currentUser = Kinvey.getActiveUser();
                            console.log($rootScope.currentUser);

                            return $rootScope.currentUser;

                        }, function (err) {
                            // Attempt to signup as a new user if no user with the identity exists.
                            if (Kinvey.Error.USER_NOT_FOUND === err.name) {
                                console.log("first login with facebook -> registration procedure");

                                return Kinvey.User.signupWithProvider(provider, tokens)
                                .then(function (user) {
                                    return facebook.getProfilePicture(user._socialIdentity.facebook.id)
                                        .then(function (imageData) {
                                            console.log(imageData);
                                            let profilePicUrl = imageData.data.url;
                                            console.log(profilePicUrl);

                                            return $http.get(profilePicUrl, {responseType: "blob"})
                                                .then(function (response) {
                                                    console.log("https response");
                                                    console.log(response);
                                                    let profImageBlob = response.data;
                                                    return kinveyConfig.authorize
                                                        .then(function () {
                                                            return Kinvey.File.upload(profImageBlob, {
                                                                mimeType: profImageBlob.type,
                                                                size: profImageBlob.size,
                                                                _acl: {
                                                                    gr: true,
                                                                    gw: false
                                                                }
                                                            }, {public: true})
                                                                .then(function (success) {
                                                                    console.log("upload success");
                                                                    console.log(success);
                                                                    return success._id;
                                                                }, function (error) {
                                                                    console.log(error);
                                                                })
                                                                .then(function (imageId) {
                                                                    // Open comments, likes and dislike for pic
                                                                    return Kinvey.DataStore.save('pictures', {
                                                                        image: {
                                                                            _type: "KinveyFile",
                                                                            _id: imageId
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
                                                                    }, {public: true})
                                                                    .then(function (picture) {
                                                                        console.log("picture");
                                                                        console.log(picture);

                                                                        // Update user and return him
                                                                        let rawFacebookName = user._socialIdentity.facebook.name;
                                                                        let facebookUsernameParts = rawFacebookName.toLowerCase().split(' ');
                                                                        let facebookUsernameReady = facebookUsernameParts.join(".");

                                                                        user.username = facebookUsernameReady;
                                                                        user.profile_picture = picture._id;
                                                                        user.followersCount = 0;
                                                                        user.followingCount = 0;

                                                                        let social = {
                                                                            _id: user._id,
                                                                            _acl: {
                                                                                gr: true,
                                                                                gw: true
                                                                            },
                                                                            followers: {},
                                                                            following: {}
                                                                        };

                                                                        Kinvey.DataStore.save("socials", social)
                                                                            .then(function (success) {
                                                                                console.log(success);
                                                                            }, function (error) {
                                                                                console.log(error);
                                                                            });

                                                                        return Kinvey.User.update(user)
                                                                        .then(function (updatedUser) {
                                                                            $rootScope.currentUser = updatedUser;
                                                                            console.log("updatedUser: ");
                                                                            console.log(updatedUser);
                                                                            console.log("finished successfully");
                                                                            return updatedUser;
                                                                        }, function (error) {
                                                                            console.log(error)
                                                                        });
                                                                }, function (error) {
                                                                    console.log(error);
                                                                });
                                                            })
                                                        });
                                                    })
                                            }, function (error) {
                                                console.log("http response error!:");
                                                console.log(error);
                                            });
                                    }
                                );
                            }
                            return Kinvey.Defer.reject(err);
                        });
                    })
                    .then(function (user) {
                        if(user) {
                            console.log("user before path change");
                            console.log(user);
                            $rootScope.currentUser = user;
                            console.log("changing path to profile from landing");
                            $location.path("/profile");
                        } else {
                            console.log("no user passed down so fuck off")
                        }
                    }, function (error) {
                        console.log(error);
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