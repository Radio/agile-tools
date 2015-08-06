angular.module('agile.directives')
    .directive('userImport', [
        'TEMPLATES_URL',
        function(TEMPLATES_URL) {

            function controller($scope, $timeout, Api, Helper) {

                $scope.showImport = false;
                $scope.showImportLoader = false;

                var searchPromise;
                $scope.searchUser = function(userQuery) {
                    if (userQuery) {
                        if (searchPromise) {
                            $timeout.cancel(searchPromise);
                        }
                        searchPromise = $timeout(function() {
                            searchPromise = null;
                            Api.get('JiraUsers').get({
                                query: userQuery
                            }).then(function(users) {
                                $scope.jiraUsers = users;
                            });
                        }, 150);
                    } else {
                        $scope.jiraUsers = [];
                    }
                };

                $scope.openImportForm = function()
                {
                    $scope.showImport = true;
                    $scope.showImportLoader = false;
                    resetImport();
                };

                $scope.hideImportForm = function()
                {
                    $scope.userQuery = '';
                    $scope.showImport = false;
                    $scope.showImportLoader = false;
                    resetImport();
                };

                $scope.addUser = function(jiraUser) {
                    if (jiraUser) {
                        $scope.showImport = false;
                        $scope.showImportLoader = true;

                        Api.get('UsersImport').post({
                            name: jiraUser.name
                        }).then(function(response) {
                            Helper.setAlert('success', response.message);
                            Api.get('User').get(jiraUser.name)
                                .then(function(user) {
                                    $scope.callback(user);
                                    $scope.hideImportForm();
                                });
                        });
                    }
                };

                function resetImport()
                {
                    $scope.jiraUsers = [];
                }
            }

            return {
                scope: {
                    callback: '='
                },
                controller: ['$scope', '$timeout', 'Api', 'Helper', controller],
                templateUrl: TEMPLATES_URL + '/user-import.directive.html'
            };
        }]);