angular.module('agile.controllers')
    .controller('Version_Timeline',
        function($scope, $location, $timeout, Api, Helper, Config,
                 ConfidenceReportService, TimelineService) {

            $scope.$watch('version', function () {
                if ($scope.project && $scope.version) {
                    loadConfidenceReport()
                        .then(function(report) {
                            var issues = report.issues.map(function(issueInfo) {
                                return issueInfo.issue;
                            });
                            var timeline = TimelineService.group(issues, $scope.version);
                            console.log(timeline);
                            $scope.timeline = timeline;
                        });
                }
            });

            function loadConfidenceReport() {
                return ConfidenceReportService
                    .load(getEntityKey($scope.project, $scope.version), ['issues']);
            }


            function getEntityKey(project, version) {
                return project.key + '-' + version.jira_id;
            }
        });