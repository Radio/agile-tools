angular.module('agile.directives')
    .directive('agileAssignees', ['$sce', 'assigneeShortFilter', function($sce, assigneeShortFilter) {

        var unassignedName = 'Unassigned';

        function getDisplayName(name)
        {
            return name ? assigneeShortFilter(name) : unassignedName;
        }

        function link($scope, element, attrs) {
            $scope.$watch('assignees', function() {
                if ($scope.assignees) {
                    var names = [];
                    for (var index = 0; index < $scope.assignees.length; index++) {
                        if ('name' in $scope.assignees[index]) {
                            names.push(
                                '<span class="name">' + getDisplayName($scope.assignees[index].name) + '</span>'
                            );
                        }
                    }
                    $scope.names = $sce.trustAsHtml(names.join(', '));
                }
            });
        }

        return {
            scope: {
                assignees: "=agileAssignees"
            },
            link: link,
            template: '<span data-ng-bind-html="names"></span>'
        };
    }]);