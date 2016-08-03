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
                    console.log(user);
                    $rootScope.currentUser = user;
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
                $rootScope.currentUser = Kinvey.getActiveUser();
                let user = $rootScope.currentUser;
                if (user !== null) {
                    let promise = $kinvey.User.logout();
                    promise.then(function () {
                        console.log("Successfully Logout");
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