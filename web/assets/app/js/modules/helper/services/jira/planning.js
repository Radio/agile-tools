angular.module('helper')
    .factory('JiraHelper_Planning', function(JiraHelper_TaskType) {
        return {
            getTotalEstimatesByAssignee: function(issues) {
                var stats = {};
                for (var i = 0; i< issues.length; i++) {
                    var issue = issues[i];
                    try {
                        var remaining = issue.fields.timetracking.remainingEstimateSeconds || 0;
                        var assignee = issue.fields.assignee.name;
                        stats[assignee] = (stats[assignee] || 0) + remaining;
                    } catch (e) {
                        // continue; ok, ok no need in continue in the end of the cycle.
                    }
                }
                return stats;
            },
            getEstimationProblems: function(issues) {
                var problems = {
                    storiesWithEstimate: [],
                    tasksWithoutEstimate: [],
                    resolvedWithEstimate: [],
                    tasksAssignedToChuck: []
                };
                issues.forEach(function(issue) {
                    try {
                        var remaining = issue.fields.timetracking.remainingEstimateSeconds || 0;
                        var assignee = issue.fields.assignee.name;
                        var issuetype = issue.fields.issuetype.name;
                        var status = issue.fields.status.name;
                        var tasktype = null;
                        var tasktypeMapped = null;
                        if (issue.fields.customfield_10150) {
                            tasktype = issue.fields.customfield_10150.value;
                            tasktypeMapped = JiraHelper_TaskType.get(tasktype);
                        }

                        if (issuetype == 'Story' && remaining > 0) {
                            problems.storiesWithEstimate.push({
                                key: issue.key,
                                summary: issue.fields.summary,
                                assignee: assignee,
                                remaining: issue.fields.timetracking.remainingEstimate
                            });
                        }
                        if (['Resolved', 'Complete'].indexOf(status) >= 0  && remaining > 0) {
                            problems.resolvedWithEstimate.push({
                                key: issue.key,
                                summary: issue.fields.summary,
                                assignee: assignee,
                                remaining: issue.fields.timetracking.remainingEstimate
                            });
                        }
                        if (['Sub-task', 'Task'].indexOf(issuetype) >= 0 &&
                            ['dev', 'doc', 'tbd'].indexOf(tasktypeMapped) >= 0 &&
                            remaining == 0) {
                            problems.tasksWithoutEstimate.push({
                                key: issue.key,
                                summary: issue.fields.summary,
                                assignee: assignee
                            });
                        }
                        if (issuetype != 'Test' &&
                            ['qa', 'tc', 'perf'].indexOf(tasktypeMapped) == -1 &&
                            assignee == 'chuck.norris') {
                            problems.tasksAssignedToChuck.push({
                                key: issue.key,
                                summary: issue.fields.summary,
                                remaining: issue.fields.timetracking.remainingEstimate
                            });
                        }
                    } catch (e) {
                        // well... donnow... skip it...
                    }
                });
                return problems;
            }
        };
    });