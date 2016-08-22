angular.module('helper')
    .factory('JiraHelper_IssueState', ['JiraHelper_TaskType', 'JiraHelper_Status',
        function(TaskType, Status) {

            var getTaskType = TaskType.get;
            var getStatusCode = Status.get;

            var taskTypesMap = {
                'inv': 'impl',
                'dev': 'impl'
            };
            function mapTaskType(taskType) {
                return taskTypesMap[taskType] !== undefined ? taskTypesMap[taskType] : taskType;
            }

            function collectStats(issue) {
                var activities = {};
                var qaAssigned = 1;

                for (var i = 0; i < issue.subtasks.length; i++) {
                    var subTask = issue.subtasks[i];
                    var taskType = getTaskType(subTask);
                    var mappedType = mapTaskType(taskType);
                    var statusCode = getStatusCode(subTask);

                    activities[mappedType] = activities[mappedType] || {total: 0, open: 0, in_progress: 0, done: 0};

                    activities[mappedType].total++;
                    if (statusCode === Status.codes.in_progress) {
                        activities[mappedType].in_progress++;
                    }
                    if (statusCode === Status.codes.open) {
                        activities[mappedType].open++;
                    }
                    if (statusCode === Status.codes.done) {
                        activities[mappedType].done++;
                    }

                    if (mappedType == 'qa') {
                        if (subTask.assignee.key == 'chuck.norris') {
                            qaAssigned = 0;
                        }
                    }
                }
                return {activities: activities, qaAssigned: qaAssigned};
            }

            function defineComplexIssueState(issue, issueState)
            {
                if (!issue.subtasks) {
                    return;
                }
                var __ret = collectStats(issue);
                var activities = __ret.activities;
                var qaAssigned = __ret.qaAssigned;

                for (var activity in activities) {
                    if (activities.hasOwnProperty(activity)) {
                        var activityInfo = activities[activity];
                        if (activityInfo && activityInfo.total) {
                            if (activityInfo.in_progress || (activityInfo.open && activityInfo.done)) {
                                issueState[activity] = Status.codes.in_progress;
                            } else if (!activityInfo.open && !activityInfo.in_progress && activityInfo.done) {
                                issueState[activity] = Status.codes.done;
                            } else {
                                issueState[activity] = Status.codes.open;
                            }
                        } else {
                            issueState[activity] = Status.codes.na;
                        }
                    }
                }
                issueState.qa_assigned = qaAssigned;

                aggregateIssueStatus(issueState);
            }

            function defineSimpleTaskState(issue, issueState)
            {
                if (issue.issuetype.name != 'Task' &&
                    issue.issuetype.name != 'Bug Report') {
                    return;
                }
                var taskType = getTaskType(issue);
                var mappedType = mapTaskType(taskType);

                issueState[mappedType] = getStatusCode(issue);
                issueState.status = issue.status.name;
            }

            function aggregateIssueStatus(issueState) {
                if (issueState.impl == 0) {
                    if (issueState.doc == -1 || issueState.doc == 0) {
                        issueState.status = 'Open';
                    } else if (issueState.doc == 1 || issueState.doc == 2) {
                        issueState.status = 'In Progress';
                    }
                } else if (issueState.impl == 2) {
                    issueState.status = 'In Progress';
                } else if (issueState.impl == 1 || issueState.impl == -1) {
                    if (issueState.doc == 0 || issueState.doc == 2) {
                        issueState.status = 'Doc';
//                    } else if (issueState.cr == 0 || issueState.cr == 2) {
//                        issueState.status = 'In CR';
                    } else if (issueState.tbd == 0 || issueState.tbd == 2) {
                        issueState.status = 'In TBD';
                    } else if (issueState.qa == 0 || issueState.qa == 2) {
                        issueState.status = 'In QA';
                    } else if (issueState.cr == 0 || issueState.cr == 2 || issueState.tc == 0 || issueState.tc == 2) {
                        issueState.status = 'Resolved';
                    } else {
                        issueState.status = 'Done';
                    }
                }
                return issueState;
            }

            return {
                get: function(issue) {
                    /**
                     * Values:
                     *     -1 means that item does not exist.
                     *      0 means item is open or not resolved
                     *      1 means item is resolved
                     *      2 means item is in progress
                     *      3 means item is on hold:, "on hold", feedback required or available but not accepted yet
                     */
                    var issueState = {
                        status: issue.status.name,
                        impl: -1,
                        doc: -1,
                        tbd: -1,
                        tc: -1,
                        qa: -1,
                        qa_assigned: 0,
                        cr: -1
                    };

                    if (issue.subtasks && issue.subtasks.length) {
                        defineComplexIssueState(issue, issueState);
                    } else {
                        defineSimpleTaskState(issue, issueState);
                    }

                    return issueState;
                }
            };
        }]);