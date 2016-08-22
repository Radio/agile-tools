angular.module('helper')
    .constant('StatusCodes', {
        na: -1,
        open: 0,
        in_progress: 2,
        done: 1,
        hold: 3 // currently not in use
    })
    .constant('StatusMap', {
        'Open': 0,
        'Reopened': 0,
        'Resolved': 1,
        'Closed': 1,
        'In Progress': 2,
        'Feedback required': 0, // todo: support 3
        'Feedback available': 0, // todo: support 3
        'On hold': 0 // todo: support 3
    })
    .factory('JiraHelper_Status', ['StatusMap', 'StatusCodes', function(StatusMap, StatusCodes) {
        return {
            get: function (issue) {
                return StatusMap[issue.status.name] || 0;
            },
            codes: StatusCodes
        };
    }]);