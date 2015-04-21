angular.module('agile.controllers')
    .controller('Version_Commitment', ['$scope', '$location', '$timeout', 'Api', 'Helper', 'Config',
                                       'onlyStoryKeyFilter', 'noStoryKeyFilter', 'dateFormatFilter',
        function($scope, $location, $timeout, Api, Helper, Config,
                 onlyStoryKeyFilter, noStoryKeyFilter, dateFormatFilter) {

            $scope.plan = {issues: []};
            $scope.showSettingsForm = true;
            $scope.sync = function(issue) {
                synchronize().then(function() {
                    saveCommitment();
                });
            };
            $scope.save = saveCommitment;
            $scope.export = exportCommitment;
            $scope.sortableOptions = getSortingOptions();
            $scope.removeIssue = function(issue) {
                removeIssueFromCommitment(issue);
                saveCommitment();
            };
            $scope.$watch('project', function () {
                if ($scope.project) {
                    loadCommitment();
                }
            });
            $scope.startDate = dateGetterSetterFactory('startDate');
            $scope.releaseDate = dateGetterSetterFactory('releaseDate');
            $scope.freezeDate = dateGetterSetterFactory('freezeDate');
            $scope.approveTill = dateGetterSetterFactory('approveTill');

            function synchronize()
            {
                $scope.syncInProgress = true;
                return loadConfidenceReport().then(function() {
                    var clrIssues = $scope.confidenceReport.issues;
                    $scope.plan.issues.forEach(function(issue) {
                        issue.missing = !(clrIssues.some(function(issueInfo) { return issueInfo.key == issue.key; }));
                    });
                    clrIssues.forEach(function(issueInfo) {
                        var exists = $scope.plan.issues.some(function(issue) { return issue.key == issueInfo.key; });
                        if (exists) {
                            updatePlanIssue(issueInfo);
                        } else {
                            createPlanIssue(issueInfo);
                        }
                    });
                    $scope.syncInProgress = false;
                    $timeout(function() {
                        $scope.plan.issues.forEach(function(issue) {
                            issue.new = false;
                        });
                    }, 3000);
                });
            }

            function updatePlanIssue(issueInfo)
            {
                var index = $scope.plan.issues.findIndex(function(issue) { return issue.key == issueInfo.key; });
                if (index >= 0) {
                    $scope.plan.issues[index].storyKey = onlyStoryKeyFilter(issueInfo.issue.summary);
                    $scope.plan.issues[index].summary = noStoryKeyFilter(issueInfo.issue.summary);
                    $scope.plan.issues[index].missing = false;
                }
            }

            function createPlanIssue(issueInfo)
            {
                var issue = {
                    key: issueInfo.key,
                    storyKey: onlyStoryKeyFilter(issueInfo.issue.summary),
                    summary: noStoryKeyFilter(issueInfo.issue.summary),
                    notes: '',
                    required: '',
                    export: true,
                    missing: false,
                    new: true
                };
                $scope.plan.issues.push(issue);
            }

            function loadConfidenceReport()
            {
                var reportId = getEntityKey($scope.project, $scope.version);
                var expandWith = ['issues'];
                return Api.get('ConfidenceReport').get(reportId, expandWith.join(','))
                    .then(function(confidenceReport) {
                        $scope.confidenceReport = confidenceReport;

                        if (typeof $scope.confidenceReport.issues == 'undefined') {
                            $scope.confidenceReport.issues = [];
                        }
                        angular.forEach($scope.confidenceReport.issues, function (issueInfo) {
                            issueInfo.issue = getIssueFromConfidenceReportExpansion(issueInfo.key);
                        });

                    }, function() {
                        Helper.setAlert('warning', 'Please build the Confidence Level Report first.');
                        $location.path('/project/' + $scope.project.key
                            + '/version/' + $scope.version.name + '/confidence_report');
                    });
            }

            function getIssueFromConfidenceReportExpansion(issueKey) {
                if ($scope.confidenceReport && $scope.confidenceReport.expansion) {
                    for (var i = 0; i < $scope.confidenceReport.expansion.issues.length; i++) {
                        if ($scope.confidenceReport.expansion.issues[i].key == issueKey) {
                            return $scope.confidenceReport.expansion.issues[i];
                        }
                    }
                }
                return {};
            }


            function loadCommitment()
            {
                var planId = getEntityKey($scope.project, $scope.version);
                return Api.get('Commitment').get(planId, 'issues')
                    .then(function(plan) {
                        $scope.plan = plan;
                    }, function() {
                        createCommitment(planId, synchronize);
                    });
            }

            function saveCommitment()
            {
                return Api.get('Commitment')
                    .put($scope.plan._id, $scope.plan)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function removeIssueFromCommitment(issue)
            {
                if (confirm('Are you sure?')) {
                    var index = $scope.plan.issues.findIndex(function(planIssue) {
                        return planIssue.key == issue.key;
                    });
                    if (index >= 0) {
                        $scope.plan.issues.splice(index, 1);
                    }
                }
            }

            function exportCommitment()
            {
                $location.path($location.path() + '/export');
            }

            function createCommitment(planId, callback)
            {
                Config.load($scope.project.key).then(function() {
                    $scope.plan = {
                        _id: planId,
                        project: $scope.project._id,
                        version: $scope.version.jira_id,
                        projectName: Config.value('project_name') || $scope.project.name,
                        projectManager: Config.value('project_manager'),
                        iteration: $scope.version.name.replace(/[^0-9]/g, ''),
                        approveBy: Config.value('approve_by'),
                        issues: []
                    };

                    Api.get('ResourcesPlan').get(planId)
                        .then(function(resourcePlan) {

                            $scope.plan.startDate = resourcePlan.startDate || $scope.version.startDate;
                            $scope.plan.releaseDate = resourcePlan.releaseDate || $scope.version.releaseDate;
                            $scope.plan.freezeDate = null;
                            $scope.plan.approveTill = null;
                            if (resourcePlan.startDate && resourcePlan.releaseDate) {
                                $scope.plan.freezeDate = moment(resourcePlan.startDate).add(
                                    resourcePlan.devDays + resourcePlan.buffer + 1, 'days'
                                )._d;
                                $scope.plan.approveTill = new Date($scope.plan.freezeDate);
                            }

                            sendPostRequest();
                        }, function() {
                            sendPostRequest();
                        });

                    function sendPostRequest()
                    {
                        Api.get('Commitments').post($scope.plan)
                            .then(function(response) {
                                Helper.setAlert('success', response.message);
                                if (callback) {
                                    var maybePromise = callback();
                                    if (maybePromise.then) {
                                        maybePromise.then(function() { saveCommitment();} );
                                    } else {
                                        saveCommitment();
                                    }
                                }
                            });
                    }
                });
            }

            function getEntityKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function getSortingOptions()
            {
                return {
                    axis: 'y',
                    delay: 200,
                    placeholder: 'sorting-placeholder',
                    start: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .addClass('sorting-active')
                            .find('.sorting-placeholder').height(ui.item.outerHeight());
                    },
                    stop: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .removeClass('sorting-active');
                        saveCommitment();
                    }
                };
            }

            function dateGetterSetterFactory(property)
            {
                return function(dateString) {
                    if (angular.isDefined(dateString)) {
                        var d = dateString.split('.');
                        return $scope.plan[property] = new Date(d[2], d[1] - 1, d[0], 10);
                    } else {
                        return dateFormatFilter($scope.plan[property], 'DD.MM.YYYY');
                    }
                };
            }
        }]);