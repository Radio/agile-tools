angular.module('agile.controllers')
    .controller('Version_Staffing', ['$rootScope', '$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($rootScope, $scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/version/staffing.html';

            $scope.$watch('project', function () {
                if ($scope.project) {
                    loadStaffing();
                }
            });

            $scope.points = [{
                key: 'reusing-knowledge',
                title: 'Practice: Using the knowledge obtained earlier'
            }, {
                key: 'planning',
                title: 'Participation in the planning: involvement, activity'
            }, {
                key: 'problems',
                title: 'Solve the problem:',
                children: [{
                    key: 'complexity',
                    title: 'complexity'
                }, {
                    key: 'speed',
                    title: 'speed'
                }, {
                    key: 'quality',
                    title: 'quality of implementation'
                }, {
                    key: 'performance',
                    title: 'performance'
                }]
            }, {
                key: 'process',
                title: 'Following the process (time tracking, TBD, CR, comments)'
            }, {
                key: 'bugs',
                title: 'Number of bugs produced during iteration'
            }];

            function loadStaffing()
            {
                var planId = getStaffingKey($scope.project, $scope.version);
                var staffingApi = Api.get('Staffing');

                return staffingApi.get(planId, 'issues')
                    .then(function(staffing) {
                        $scope.staffing = staffing;
                    }, function() {
                        createStaffing(planId);
                    });
            }

            function createStaffing(planId)
            {
                $scope.staffing = {
                    '_id': planId,
                    'project': $scope.project._id,
                    'version': $scope.version.jira_id,
                    'users': []
                };
                updateStaffingUsers();
                return Api.get('Staffings')
                    .post($scope.staffing)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function updateStaffingUsers()
            {
                angular.forEach($scope.project.users, function(user) {
                    if (!userExists(user)) {
                        $scope.staffing.users.push({
                            key: user.key,
                            name: user.name,
                            points: {}
                        });
                    }
                });
            }


            function userExists(user)
            {
                for (var i = 0; i < $scope.staffing.users.length; i++) {
                    if ($scope.staffing.users[i].key == user.key) {
                        return true;
                    }
                }
                return false;
            }


            function getStaffingKey(project, version) {
                return project.key + '-' + version.jira_id;
            }
        }]);