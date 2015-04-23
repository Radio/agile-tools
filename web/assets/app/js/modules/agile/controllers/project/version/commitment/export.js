angular.module('agile.controllers')
    .controller('Version_Commitment_Export', ['$scope', '$location',
        function($scope, $location) {
            $scope.hideExportPage = function() {
                $location.path('/project/' + $scope.project.key +
                    '/version/' + $scope.version.name + '/plan');
            };
            $scope.plannedTotal = function() {
                return $scope.plan.issues.reduce(function(total, issue) {
                    return issue.export ? total + 1 : total;
                }, 0);
            };
            $scope.requiredTotal = function() {
                return $scope.plan.issues.reduce(function(total, issue) {
                    return issue.export && issue.required ? total + 1 : total;
                }, 0);
            };
        }]);