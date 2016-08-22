angular.module('agile.directives')
    .directive('timeline', ['$sce', 'TEMPLATES_URL', function($sce, TEMPLATES_URL) {

        var overallWidth = 800;
        // todo: get real days number and work capacity.
        var days = 6;
        var hourWidth = 800 / (6.5 * days);

        return {
            scope: {
                timeline: "="
            },
            controller: ['$scope', function ($scope)
            {
                $scope.getTaskWidth = function(task) {
                    return parseInt(hourWidth * getMaxTime(task) / 3600);
                };

                function getMaxTime(task) {
                    var overspent = task.time.aggr.spent - task.time.aggr.estimated + task.time.aggr.remaining;
                    return Math.max(
                        task.time.aggr.spent + task.time.aggr.remaining,
                        task.time.aggr.estimated + (overspent > 0 ? overspent : 0)
                    );
                }
            }],
            templateUrl: TEMPLATES_URL + '/project/version/timeline/timeline.directive.html'
        };
    }]);