angular.module('agile.controllers')
    .controller('Version_Resources', function($rootScope, $scope, $location, Api, Helper, dateFormatFilter,
                                              JiraHelper_Planning) {
        $scope.plan = {};
        $scope.showSettingsForm = true;

        var userCalc = {
            getDevDays: function(user) {
                return (user.type == 'QA' ? $scope.plan.qaDays : $scope.plan.devDays) || 0;
            },
            getDevDaysTotal: function(user) {
                return (this.getDevDays(user) + user.devAmendment) * user.ratio * user.assignment;
            },
            getDiff: function(user) {
                return this.getAvailable(user) - user.allocated;
            },
            getAvailable: function(user) {
                return parseFloat(Number(this.getDevDaysTotal(user) * user.devHoursPerDay).toFixed(2));
            },
            recalculate: function(user) {
                user.devDaysTotal = this.getDevDaysTotal(user);
                user.diff = this.getDiff(user);
                user.available = this.getAvailable(user);
            },
            recalculateAll: function() {
                (function(calc) {
                    if ($scope.plan.users) {
                        $scope.plan.users.forEach(function(user) {
                            calc.recalculate(user);
                        });
                    }
                })(this);
            }
        };
        var planCalc = {
            getIterationLength: function() {
                if ($scope.plan.startDate && $scope.plan.releaseDate) {
                    return moment($scope.plan.releaseDate)
                        .businessDiff(moment($scope.plan.startDate));
                }
                return 0;
            },
            getDevDays: function() {
                if ($scope.plan.length) {
                    return $scope.plan.length - $scope.plan.buffer - $scope.plan.qaDays;
                }
                return $scope.plan.devDays;
            },
            getQaDays: function () {
                if ($scope.plan.length) {
                    return $scope.plan.length - $scope.plan.buffer - $scope.plan.devDays;
                }
                return $scope.plan.qaDays;
            }
        };
        $scope.userCalc = userCalc;
        $scope.planCalc = planCalc;
        $scope.total = function(type, prop) {
            var total = 0;
            if ($scope.plan.users) {
                for (var i = 0; i < $scope.plan.users.length; i++) {
                    if ($scope.plan.users[i].type == type) {
                        total += $scope.plan.users[i][prop];
                    }
                }
            }
            return total;
        };

        $scope.$watch('project', function () {
            if ($scope.project) {
                loadResourcesPlan();
            }
        });
        $scope.$watchGroup(['plan.startDate', 'plan.releaseDate'], function () {
            $scope.plan.length = planCalc.getIterationLength();
        });
        $scope.$watch('plan.length', function () {
            $scope.plan.qaDays = planCalc.getQaDays();
            userCalc.recalculateAll();
        });
        $scope.startDate = dateGetterSetterFactory('startDate');
        $scope.releaseDate = dateGetterSetterFactory('releaseDate');

        $scope.save = saveResourcePlan;
        $scope.export = exportResourcePlan;
        $scope.sync = function() {
            if (!$scope.plan.users.length) {
                Helper.setAlert('warning', 'Please import users before.');
                return;
            }
            synchronize();
            saveResourcePlan();
        };
        $scope.updateUsers = function() {
            syncUsersFromProject();
            saveResourcePlan();
        };
        $scope.removeUser = function(user) {
            removeUserFromPlan(user);
            saveResourcePlan();
        };

        function loadResourcesPlan()
        {
            var planId = getResourcesPlanKey($scope.project, $scope.version);
            return Api.get('ResourcesPlan').get(planId, 'issues')
                .then(function(plan) {
                    $scope.plan = plan;
                }, function() {
                    createResourcesPlan(planId);
                });
        }

        function saveResourcePlan()
        {
            return Api.get('ResourcesPlan')
                .put($scope.plan._id, $scope.plan)
                .then(function(response) {
                    Helper.setAlert('success', response.message);
                });
        }

        function exportResourcePlan()
        {
            $location.path($location.path() + '/export');
        }

        function createResourcesPlan(planId)
        {
            $scope.plan = {
                _id: planId,
                project: $scope.project._id,
                version: $scope.version.jira_id,
                users: [],
                startDate: $scope.version.startDate,
                releaseDate: $scope.version.releaseDate,
                buffer: 1,
                devDays: 6
            };
            syncUsersFromProject();
            return Api.get('ResourcesPlans')
                .post($scope.plan)
                .then(function(response) {
                    Helper.setAlert('success', response.message);
                });
        }

        function syncUsersFromProject()
        {
            var userTemplate = {
                devDaysTotal: 0,
                diff: 0,
                available: 0,
                allocated: 0,
                devHoursPerDay: 6.5,
                devAmendment: 0,
                ratio: 1,
                assignment: 1
            };
            for (var i = 0; i < $scope.project.users.length; i++) {
                var user = $scope.project.users[i];
                if (user.is_active) {
                    var index = resourcePlanHasUser(user.key);
                    if (!index) {
                        var numberOfUsers = $scope.plan.users.push(angular.extend({
                            key: user.key,
                            name: user.name,
                            type: user.type,
                            assignment: user.assignment,
                            ratio: user.ratio,
                            devHoursPerDay: user.type == 'QA' ? 7.5 : 6.5
                        }, userTemplate));
                        userCalc.recalculate($scope.plan.users[numberOfUsers - 1]);
                    }
                }
            }
            sortUsers();
        }

        function resourcePlanHasUser(userKey)
        {
            for (var i = 0; i < $scope.plan.users.length; i++) {
                if ($scope.plan.users[i].key == userKey) {
                    return i + 1;
                }
            }
            return false;
        }

        function removeUserFromPlan(user)
        {
            if (confirm('Are you sure?')) {
                var index = resourcePlanHasUser(user.key);
                if (index) {
                    $scope.plan.users.splice(index - 1, 1);
                }
            }
        }
        function sortUsers() {
            $scope.plan.users.sort(function (user1, user2) {
                if (user1.name == user2.name) {
                    return 0;
                } else {
                    return user1.name < user2.name ? -1 : 1;
                }
            });
        }

        function getResourcesPlanKey(project, version) {
            return project.key + '-' + version.jira_id;
        }

        function synchronize()
        {
            $scope.syncInProgress = true;
            loadVersionTasks().then(function(tasks) {
                console.info(tasks.length + ' tasks loaded');
                var estimates = JiraHelper_Planning.getTotalEstimatesByAssignee(tasks);
                var problems = JiraHelper_Planning.getEstimationProblems(tasks);
                $scope.plan.users.forEach(function(user) {
                    user.allocated = (estimates[user.key] || 0) / 3600;
                });
                $scope.planningProblems = problems;
                $scope.syncInProgress = false;
            });
        }

        function loadVersionTasks()
        {
            var usersList = $scope.plan.users.reduce(function(list, user) {
                list.push(user.key);
                return list;
            }, []);
            var request = {
                // customfield_10150 is a task type
                _fields: "summary,timetracking,assignee,issuetype,parent,status,customfield_10150",
                max_result: 1000,
                jql: 'project = ' + $scope.project.key +
                    ' AND fixVersion = ' + $scope.version.jira_id
                    //' AND issuetype in ("Bug Report", "Task", "Sub-task")' +
                    //' AND status in (Open)' +
                    //' AND assignee in (' + usersList.join(',') + ')'
            };
            console.info('Loading issues with query: ' + request.jql);
            Api.get('JiraIssues').disableCache();
            var promise = Api.get('JiraIssues').get(request);
            Api.get('JiraIssues').enableCache();
            return promise;
        }
        function dateGetterSetterFactory(property)
        {
            return function(dateString) {
                if (angular.isDefined(dateString)) {
                    var d = dateString.split('.');
                    $scope.plan[property] = new Date(d[2], d[1] - 1, d[0], 10);
                }
                return dateFormatFilter($scope.plan[property], 'DD.MM.YYYY');
            };
        }
    });