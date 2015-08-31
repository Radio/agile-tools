angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_IssueInfo',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper_Version) {
            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/edit/issue_info.html';

            $scope.issueIsUpdating = false;

            $scope.updateIssue = function() {
                $scope.issueIsUpdating = true;
                $scope.$parent.updateIssues([$scope.issueInfo.key]).then(function() {
                    $scope.issueIsUpdating = false;
                    Helper.setAlert('success', 'Issue has been updated.');
                }, function() {
                    $scope.issueIsUpdating = false;
                });
            };

            $scope.removeIssue = function() {
                $scope.$parent.removeIssue($scope.issueInfo);
            };

            $scope.archiveIssue = function() {
                $scope.issueInfo.archived = true;
                $scope.saveConfidenceReport();
                $scope.$emit('confidenceReportChanged');
            };

            $scope.getRowClass = function() {

                return {
                    'good': $scope.issueInfo.cl > 6,
                    'so-so': $scope.issueInfo.cl <= 6 && $scope.issueInfo.cl > 3,
                    'bad': $scope.issueInfo.cl <= 3,
                    'neutral': !$scope.issueInfo.cl,
                    'updating': $scope.issueIsUpdating || $scope.showUpdateLoader,
                    'wrong-version': !JiraHelper_Version.isInVersion($scope.issueInfo.issue, $scope.version)
                };
            };

            $scope.getSmallKey = function(key)
            {
                return key.replace(/^.+?-/, '');
            };
        });