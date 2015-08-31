angular.module('agile.services')
    .factory('TimelineService', function(JiraHelper_Status, JiraHelper_Version) {
        return {
            group: function(issues, version) {
                var timeline = {};
                issues.forEach(processIssue);

                function processIssue(issue) {
                    if (issue.subtasks && issue.subtasks.length) {
                        issue.subtasks.forEach(processIssue);
                    } else {
                        if (issueIsRelevant(issue, version)) {
                            if (!timeline[issue.assignee.key]) {
                                timeline[issue.assignee.key] = [];
                            }
                            timeline[issue.assignee.key].push(issue);
                        }
                    }
                }

                return timeline;
            }
        };

        function issueIsRelevant(issue, version) {
            return JiraHelper_Version.isInVersion(issue, version)
                && issue.time.aggr.estimated;
        }

    });