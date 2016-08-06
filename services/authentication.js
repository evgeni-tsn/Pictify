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
                    let promise = Kinvey.File.stream($rootScope.currentUser.profile_picture);
                    promise.then(function (img) {
                        console.log(img);
                        $rootScope.profPic = img;
                    }, function (error) {
                        console.log(error);
                    })
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
                        $rootScope.currentUser = Kinvey.getActiveUser();
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