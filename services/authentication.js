angular.module('myApp.authentication', [])
    .factory('authentication', ['$rootScope', '$kinvey', 'kinveyConfig', '$route', '$location',
        function ($rootScope, $kinvey, kinveyConfig, $route, $location) {

            function registerUser(user) {
                kinveyConfig.authorize
                    .then(function () {
                        let promise = $kinvey.User.signup({
                            username: user.username,
                            password: user.password,
                            profile_picture: '57b0ca18cff2859c1ea246be'
                        });
                        promise.then(function (user) {
                            console.log("Hello, your name is: " + user.username);
                            console.log(user);
                            $rootScope.currentUser = Kinvey.getActiveUser();
                            // $route.reload();
                            $location.path("/profile");
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
                            $rootScope.currentUser = Kinvey.getActiveUser();
                            let promise = Kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
                            promise.then(function (pic) {
                                console.log(pic);
                                $rootScope.profPic = pic;
                                $location.path("/profile")
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
                                $rootScope.currentUser = null;
                                $rootScope.profPic = null;
                                $location.path('/landing');
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