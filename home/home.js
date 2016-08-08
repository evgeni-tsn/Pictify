'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home'
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', '$kinvey', 'kinveyConfig', '$q', '$window', '$location', '$route', 'authentication',
        function ($rootScope, $scope, $kinvey, kinveyConfig, $q, $window, $location, $route, authentication) {
            $scope.pageName = "Login Page";

            $scope.login = function (user) {
                authentication.loginUser(user);
            };

            $scope.logout = function () {
                authentication.logout();
            };

            $scope.loginFbk = function () {
                var deferred = Kinvey.Defer.deferred();
                var promise = deferred.promise;
                // Login with the Facebook SDK
                FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        return deferred.resolve(response.authResponse);
                    }
                    FB.login(function (response) {
                        deferred.resolve(response.authResponse);
                    });
                });
                promise.then(function (authResponse) {
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
                }).then(function (user) {
                    console.log(user)
                    console.log(user._socialIdentity.facebook)
                }).catch(function (err) {
                    console.log(err)
                });
            };


            $scope.loginGoogle = function () {
                var promise = $kinvey.Social.connect(null, 'google', {redirect: 'http://localhost:8000'});
                promise.then(function (user) {
                    console.log(user);
                    console.log(user._socialIdentity.google)
                }, function (err) {
                    alert("MAMKAMO OSRA SA -> " + err);
                    console.log(err)
                });
            };

            $scope.checkRegisterDetails = function (user) {
                authentication.registerUser(user);
            };

            let init = function () {
                $kinvey.init({
                    appKey: kinveyConfig.appKey,
                    appSecret: kinveyConfig.appSecret
                }).then(function () {
                    $rootScope.currentUser = Kinvey.getActiveUser();
                    if(!$rootScope.currentUser) {
                        console.log("No active user");
                    }
                });
            };

            init();
        }]);