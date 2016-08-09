angular.module('myApp.authentication', [])
    .factory('authentication', ['$rootScope', '$kinvey', 'kinveyConfig', '$route', function ($rootScope, $kinvey, kinveyConfig, $route) {

        function registerUser(user) {
            kinveyConfig.authorize
                .then(function () {
                    let promise = $kinvey.User.signup({
                        username: user.username,
                        password: user.password
                    });
                    promise.then(function (user) {
                        console.log("Hello, your name is: " + user.username);
                        console.log(user);
                        $route.reload();
                        $rootScope.currentUser = user;
                    }, function (err) {
                        console.log(err);
                    });
                });
        }

        function loginUser(user) {
            kinveyConfig.authorize
                .then(function () {
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
                            $route.reload();
                        }, function (error) {
                            console.log(error);
                        })
                    }, function (err) {
                        console.log(err);
                    });
                })
        }

        function logout() {
            kinveyConfig.authorize
                .then(function () {
                    $rootScope.currentUser = Kinvey.getActiveUser();
                    let user = $rootScope.currentUser;
                    if (user !== null) {
                        let promise = $kinvey.User.logout();
                        promise.then(function () {
                            console.log("Successfully Logout");
                            $rootScope.currentUser = Kinvey.getActiveUser();
                            $route.reload();
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