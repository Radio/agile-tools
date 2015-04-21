angular.module('agile.controllers')
    .controller('Version_Resources_Export', ['$scope', '$location',
        function($scope, $location) {

            $scope.hideAdditionalInfo = true;

            $scope.hideExportPage = function() {
                $location.path('/project/' + $scope.project.key
                    + '/version/' + $scope.version.name + '/resources');
            };
        }]);