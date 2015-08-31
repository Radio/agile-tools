angular.module('agile.services')
    .factory('ConfidenceReportService', function(Api, JiraHelper) {
        return {
            load: function (reportKey, expandWith) {
                expandWith = expandWith || ['issues'];

                return Api.get('ConfidenceReport').get(reportKey, expandWith.join(','))
                    .then(function(confidenceReport) {
                        if (typeof confidenceReport.issues == 'undefined') {
                            confidenceReport.issues = [];
                        }
                        injectExpansion(confidenceReport);

                        return confidenceReport;
                    });
            },
            create: function (reportKey, project, version) {
                var confidenceReport = {
                    '_id': reportKey,
                    'project': project,
                    'version': version,
                    'issues': []
                };
                return Api.get('ConfidenceReports')
                    .post(confidenceReport);
            },
            save: function (confidenceReport) {
                var confidenceRecordData = $.extend(true, {}, confidenceReport);
                extractExpansion(confidenceRecordData);
                return Api.get('ConfidenceReport')
                    .put(confidenceRecordData._id, confidenceRecordData);
            },
            removeIssue: function (issueInfo, confidenceReport) {
                var issueIndex = confidenceReport.issues.indexOf(issueInfo);
                if (issueIndex > -1) {
                    confidenceReport.issues.splice(issueIndex, 1);
                }
            },
            actualizeIssueState: function (issueInfo) {
                var issueState = JiraHelper.getIssueState(issueInfo.issue);
                for (var property in issueState) {
                    if (issueState.hasOwnProperty(property)) {
                        issueInfo[property] = issueState[property];
                    }
                }
            },
            actualizeIssueAssignees: function (issueInfo) {
                issueInfo.assignees = JiraHelper.getStoryAssignees(issueInfo.issue);
            }
        };

        function injectExpansion(confidenceReport) {
            angular.forEach(confidenceReport.issues, function (issueInfo) {
                issueInfo.issue = getIssueFromExpansion(confidenceReport.expansion, issueInfo.key);
                issueInfo.reviews = [];
                if (confidenceReport.expansion.reviews && issueInfo.issue.reviews) {
                    angular.forEach(issueInfo.issue.reviews, function (reviewKey) {
                        issueInfo.reviews.push(getReviewFromExpansion(confidenceReport.expansion, reviewKey));
                    });
                }
            });
        }

        function extractExpansion(confidenceReport) {
            angular.forEach(confidenceReport.issues, function (issueInfo) {
                delete issueInfo.issue;
                delete issueInfo.reviews;
            });
        }

        function getIssueFromExpansion(expansion, issueKey) {
            if (expansion && expansion.issues) {
                for (var i = 0; i < expansion.issues.length; i++) {
                    if (expansion.issues[i].key == issueKey) {
                        return expansion.issues[i];
                    }
                }
            }
            return {};
        }

        function getReviewFromExpansion(expansion, reviewKey) {
            if (expansion && expansion.reviews) {
                for (var i = 0; i < expansion.reviews.length; i++) {
                    if (expansion.reviews[i].key == reviewKey) {
                        return expansion.reviews[i];
                    }
                }
            }
            return {};
        }
    });