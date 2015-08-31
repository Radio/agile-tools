angular.module('agile.controllers')
    .controller('Version_ConfidenceReport',
        function($rootScope, $scope, $location, $q, Api, Helper, JiraHelper, Config, ConfidenceReportService) {

            $scope.searchIssue = '';

            $scope.loadConfidenceReport = loadConfidenceReport;
            $scope.saveConfidenceReport = saveConfidenceReport;
            $scope.updateConfidenceReport = updateConfidenceReport;
            $scope.updateIssues = updateIssues;
            $scope.removeIssue = removeIssue;

            $scope.sortableOptions = getSortingOptions();

            $scope.exportConfidenceReport = function() {
                $location.path($location.path() + '/export');
            };

            $scope.$watch('version', function () {
                if ($scope.project && $scope.version) {
                    $scope.loadConfidenceReport().then(function() {
                        initFilterRowFixing();
                    });
                }
            });

            $scope.$on('confidenceReportChanged', function() {
                fillSortedIssues();
            });

            // Protected functions

            function getConfidenceReportKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function loadConfidenceReport()
            {
                var reportKey = getConfidenceReportKey($scope.project, $scope.version);
                var expandWith = ['issues'];
                if (Config.value('import_reviews')) {
                    expandWith.push('reviews');
                }

                return ConfidenceReportService
                    .load(reportKey, expandWith)
                    .then(function(confidenceReport) {
                        $scope.confidenceReport = confidenceReport;
                        $scope.$broadcast('confidenceReportChanged');
                    }, function(response) {
                        if (response.status == 404) {
                            createConfidenceReport(reportKey);
                        }
                    });
            }

            function createConfidenceReport(reportKey)
            {
                return ConfidenceReportService
                    .create(reportKey, $scope.project._id, $scope.version.jira_id)
                    .then(function(response) {
                        loadConfidenceReport();
                        Helper.setAlert('success', response.message);
                    });
            }

            function saveConfidenceReport()
            {
                return ConfidenceReportService
                    .save($scope.confidenceReport)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function updateConfidenceReport()
            {
                var importKeys = [];
                $scope.confidenceReport.issues.forEach(function(issueInfo) {
                    importKeys.push(issueInfo.key);
                });
                if (importKeys.length) {
                    $scope.showUpdateLoader = true;
                    updateIssues(importKeys).then(function() {
                        $scope.showUpdateLoader = false;
                        Helper.setAlert('success', 'Issues have been updated.');
                    });
                }
            }

            var issuesUpdatingQueue = [];
            var issuesUpdatingCounter = 0;
            function updateIssues(issueKeys) {
                var deferred = $q.defer();
                issuesUpdatingCounter++;
                Api.get('IssuesImport').post({
                    keys: issueKeys
                }).then(function(response) {
                    Helper.setAlert('success', response.message);
                    issuesUpdatingCounter--;
                    if (!issuesUpdatingCounter) {
                        updateConfidenceReportAfterIssuesImport();
                    }
                }, function() {
                    issuesUpdatingCounter--;
                    deferred.reject();
                });

                issuesUpdatingQueue.push({
                    keys: issueKeys,
                    deferred: deferred
                });

                return deferred.promise;
            }

            function updateConfidenceReportAfterIssuesImport()
            {
                // Saving report to preserve user input during importing.
                saveConfidenceReport().then(function() {
                    loadConfidenceReport().then(function() {

                        actualizeQueuedIssues(issuesUpdatingQueue);
                        resolveQueuedDeferred(issuesUpdatingQueue);
                        issuesUpdatingQueue = [];

                        $scope.$broadcast('confidenceReportChanged');

                        saveConfidenceReport();

                    }, function() {
                        rejectQueuedDeferred(issuesUpdatingQueue);
                    });
                });
            }

            function actualizeQueuedIssues(queue)
            {
                var issueKeys = [];
                queue.forEach(function(queueItem) {
                    issueKeys = issueKeys.concat(queueItem.keys);
                });
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    if (issueKeys.indexOf(issueInfo.key) >= 0) {
                        ConfidenceReportService.actualizeIssueState(issueInfo);
                        ConfidenceReportService.actualizeIssueAssignees(issueInfo);
                    }
                });
            }

            function resolveQueuedDeferred(queue)
            {
                queue.forEach(function(queueItem) {
                    queueItem.deferred.resolve();
                });
            }
            function rejectQueuedDeferred(queue)
            {
                queue.forEach(function(queueItem) {
                    queueItem.deferred.reject();
                });
            }

            function removeIssue(issueInfo) {
                if (confirm("Are you sure?")) {
                    ConfidenceReportService.removeIssue(issueInfo, $scope.confidenceReport);
                    saveConfidenceReport().then(function() {
                        $scope.$broadcast('confidenceReportChanged');
                        Helper.setAlert('success', 'Issue has been removed.');
                    });
                }
            }

            /**
             * Todo: move to directive.
             */
            function initFilterRowFixing()
            {
                var $filter = $('.filter-row');
                if ($filter.length && !$filter.data('row-fixed')) {
                    // Leave a placeholder to prevent changing the window height
                    //  and therefore the scroll event again.
                    $filter.parent('.filter-row-container').height($filter.outerHeight());
                    var initialTopOffset = $filter.offset().top;
                    $(window).scroll(function() {
                        if ($(this).scrollTop() >= initialTopOffset) {
                            $filter.addClass('fixed');
                        } else {
                            $filter.removeClass('fixed');
                        }
                    });
                    $filter.data('row-fixed', true);
                }
            }

            /**
             * todo: move to directive.
             */
            function fillSortedIssues()
            {
                $scope.sortedIssues = {
                    export: [],
                    watch: [],
                    archive: []
                };
                for (var i = 0; i < $scope.confidenceReport.issues.length; i++) {
                    var issue = $scope.confidenceReport.issues[i];
                    if (issue.archived) {
                        $scope.sortedIssues.archive.push(issue);
                    } else {
                        issue.archived = false;
                        if (issue.export) {
                            $scope.sortedIssues.export.push(issue);
                        } else {
                            issue.export = false;
                            $scope.sortedIssues.watch.push(issue);
                        }
                    }
                }
            }

            /**
             * todo: move to directive.
             */
            function getSortingOptions()
            {
                return {
                    axis: 'y',
                    delay: 200,
                    connectWith: '.sorting-container',
                    placeholder: 'sorting-placeholder',
                    start: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .addClass('sorting-active')
                            .find('.sorting-placeholder').height(ui.item.outerHeight());
                        if ($scope.searchIssue.length) {
                            // Cancel sorting if list is filtered.
                            ui.item.sortable.cancel();
                        }
                    },
                    stop: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .removeClass('sorting-active');
                        applySorting();
                        $scope.saveConfidenceReport().then(function() {
                            $scope.$broadcast('confidenceReportChanged');
                        });
                    }
                };
            }

            /**
             * todo: move to directive.
             */
            function applySorting()
            {
                var i, issues = [];
                for (i = 0; i < $scope.sortedIssues.export.length; i++) {
                    $scope.sortedIssues.export[i].export = true;
                    $scope.sortedIssues.export[i].archived = false;
                    issues.push($scope.sortedIssues.export[i]);
                }
                for (i = 0; i < $scope.sortedIssues.watch.length; i++) {
                    $scope.sortedIssues.watch[i].export = false;
                    $scope.sortedIssues.watch[i].archived = false;
                    issues.push($scope.sortedIssues.watch[i]);
                }
                for (i = 0; i < $scope.sortedIssues.archive.length; i++) {
                    $scope.sortedIssues.archive[i].export = false;
                    $scope.sortedIssues.archive[i].archived = true;
                    issues.push($scope.sortedIssues.archive[i]);
                }
                $scope.confidenceReport.issues = issues;
            }

        });