angular.module('agile.services')
    .factory('TimelineService', function(JiraHelper_Status, JiraHelper_Version) {
        return {
            group: function(issues, version) {
                return issues.reduce(processIssue, {});

                function processIssue(timeline, issue) {
                    if (issue.subtasks && issue.subtasks.length) {
                        issue.subtasks.reduce(processIssue, timeline);
                    } else {
                        if (issueIsRelevant(issue, version)) {
                            var containerKey = issue.parent.key || issue.key;
                            if (!timeline[issue.assignee.key]) {
                                timeline[issue.assignee.key] = {
                                    assignee: {
                                        key: issue.assignee.key,
                                        name: issue.assignee.name
                                    },
                                    queue: {}
                                };
                            }
                            if (!timeline[issue.assignee.key]['queue'][containerKey]) {
                                timeline[issue.assignee.key]['queue'][containerKey] = {
                                    story: {
                                        key: containerKey
                                    },
                                    tasks: []
                                };
                            }
                            timeline[issue.assignee.key]['queue'][containerKey]['tasks'].push(issue);
                        }
                    }
                    return timeline;
                }
            }
        };

        function issueIsRelevant(issue, version) {
            return JiraHelper_Version.isInVersion(issue, version) &&
                (issue.time.aggr.estimated || issue.time.aggr.remaining);
        }

    });