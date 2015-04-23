angular.module('agile.services')
//    .config(['$httpProvider', function($httpProvider) {
//        $httpProvider.interceptors.push(function($q) {
//            return {
//                'responseError': function(response) {
//                    console.log(response);
//                    return response;
//                }
//            };
//        });
//    }])
    .factory('Auth',
        function($http, $location, $routeSegment, $window, Routing) {
        var redirectTo = null;
        var userInfo = {};
        var loginUrl = Routing.segment('login');
        var startUrl = Routing.segment('projects');
        return {
            signIn: function(username, password) {
                var postData = {
                    username: username,
                    password: password
                };
                return $http.post(loginUrl, postData);
            },
            signOut: function() {
                userInfo = {};
                return $http.delete(loginUrl).success(function() {
                    $location.path(loginUrl);
                });
            },
            check: function(redirect) {
                return $http.get(loginUrl + '/check').success(function(data) {
                    if ('user' in data) {
                        userInfo = data.user;
                    }
                }).error(function() {
                    userInfo = {};
                    if (redirect) {
                        $location.path(loginUrl);
                    }
                });
            },
            setRedirectTo: function(url) {
                redirectTo = url;
            },
            redirectAfterLogin: function() {
                if (redirectTo) {
                    $location.path(redirectTo);
                } else {
                    if ($location.path() == '/login') {
                        $location.path(startUrl);
                    } else {
                        $window.location.reload();
                    }
                }
                redirectTo = null;
            },
            getUserInfo: function()
            {
                return userInfo;
            }
        };
    });