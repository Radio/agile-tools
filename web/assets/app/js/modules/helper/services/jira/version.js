angular.module('helper')
    .factory('JiraHelper_Version', function() {
        return {
            isInVersion: function (issue, version) {
                if (!issue) {
                    return true;
                }
                if (issue.versions) {
                    for (var i = 0; i < issue.versions.length; i++) {
                        if (issue.versions[i].id == version.jira_id) {
                            return true;
                        }
                    }
                }
                return false;
            }
        };
    });