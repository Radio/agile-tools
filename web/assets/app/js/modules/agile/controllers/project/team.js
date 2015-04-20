angular.module('agile.controllers')
    .controller('Team', ['$scope', 'Api', 'Helper',
        function($scope, Api, Helper) {
            $scope.addUserCallback = function(user) {
                addUserToProject(user);
                $scope.saveProject();
            };

            $scope.totalByType = function(type) {
                if (!$scope.project || !$scope.project.users) {
                    return 0;
                }
                return $scope.project.users.reduce(function(total, user) {
                    return user.is_active && (type && user.type == type || !type && !user.type) ? total + 1 : total;
                }, 0);
            };

            $scope.totalByIsActive = function(is_active) {
                if (!$scope.project || !$scope.project.users) {
                    return 0;
                }
                return $scope.project.users.reduce(function(total, user) {
                    return (!!user.is_active == is_active) ? total + 1 : total;
                }, 0);
            };

            $scope.removeUser = function(user) {
                removeUserFromProject(user);
                $scope.saveProject();
            };

            function removeUserFromProject(user)
            {
                if (confirm('Are you sure?')) {
                    var index = projectHasUser(user.key);
                    if (index) {
                        $scope.project.users.splice(index - 1, 1);
                    }
                }
            }

            function addUserToProject(user)
            {
                if (!$scope.project.users) {
                    $scope.project.users = [];
                }
                if (!projectHasUser(user.key)) {
                    $scope.project.users.push({
                        key: user.key,
                        name: user.name,
                        assignment: 1,
                        ratio: 1,
                        is_active: true
                    });
                    sortUsers();
                }
            }

            function projectHasUser(userKey)
            {
                for (var i = 0; i < $scope.project.users.length; i++) {
                    if ($scope.project.users[i].key == userKey) {
                        return i + 1;
                    }
                }
                return false;
            }

            function sortUsers() {
                $scope.project.users.sort(function (user1, user2) {
                    if (user1.name == user2.name) {
                        return 0;
                    } else {
                        return user1.name < user2.name ? -1 : 1;
                    }
                });
            }
        }]);