angular.module('myApp.authentication', [])
    .factory('authentication', ['$rootScope', '$kinvey', 'kinveyConfig', function ($rootScope, $kinvey, kinveyConfig) {

        function registerUser(user) {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let promise = $kinvey.User.signup({
                    username: user.username,
                    password: user.password
                });
                promise.then(function (user) {
                    console.log("Hello, your name is: " + user.username);
                    console.log(user)
                }, function (err) {
                    console.log(err);
                });
            });
        }

        function loginUser(user) {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let promise = $kinvey.User.login({
                    username: user.username,
                    password: user.password
                });
                promise.then(function (user) {
                    console.log(user);
                    $rootScope.currentUser = user;
                    $('#loginModal').modal('hide');
                }, function (err) {
                    console.log(err);
                });
            })
        }

        function logout() {
            $kinvey.init({
                appKey: kinveyConfig.appKey,
                appSecret: kinveyConfig.appSecret
            }).then(function () {
                let user = $kinvey.getActiveUser();
                if (user !== null) {
                    let promise = $kinvey.User.logout();
                    promise.then(function () {
                        console.log("Successfully Logout");
                        $rootScope.currentUser = {};
                        $rootScope.currentUser.username = "No active user";
                    }, function (err) {
                        console.log(err);
                    });
                }
            })
        }

        return {
            registerUser: registerUser,
            loginUser: loginUser,
            logout: logout
        }
    }]);