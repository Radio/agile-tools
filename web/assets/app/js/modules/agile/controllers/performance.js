angular.module('agile.controllers')
    .controller('Performance', ['$scope', '$routeParams', '$filter', 'Api', 'Helper',
        function($scope, $routeParams, $filter, Api, Helper) {

            $scope.filters = {
                project: null
            };
            $scope.stats = {};

            $scope.$watch('filters.project', reloadStats);

            loadUser().then(function() {
                Helper.setTitle('Performance: ' + $scope.user.name);
                loadProjects().then(function() {
                    reloadStats();
                });
            });

            function reloadStats() {
                $scope.$broadcast('reload-stats');
            }

            function loadUser() {
                return Api.get('User').get($routeParams.user)
                    .then(function (user) {
                        $scope.statsUser = user;
                    });
            }

            function loadProjects()
            {
                return Api.get('Projects').get({
                    user: $scope.statsUser.key,
                    _fields: 'key,name,avatar_urls'
                }).then(function(projects) {
                    $scope.projects = projects;
                });
            }
        }]);