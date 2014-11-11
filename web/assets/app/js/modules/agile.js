angular.module('agile', [
        'ngRoute',
        'agile.controllers',
        'agile.filters',
        'route-segment',
        'view-segment'
//        'ngDraggable'
    ])
    .constant('TEMPLATES_URL', '/assets/app/templates')
    .config(['$routeProvider', '$routeSegmentProvider', '$locationProvider', '$httpProvider', 'TEMPLATES_URL',
        function($routeProvider, $routeSegmentProvider, $locationProvider, $httpProvider, TEMPLATES_URL) {
// todo: implement BE routing to handle this.
            $locationProvider.html5Mode(true);

//            $httpProvider.interceptors.push(function($q) {
//                return {
//                    'responseError': function(response) {
//                        console.log(response);
//                        return response;
//                    }
//                };
//            });

            /**
             * Managing redirects through native $routeProvider.
             */
            $routeProvider
                .when('/project/:projectKey/:versionName', {
                    redirectTo: function(params) {
                        var defaultTab = 'confidence_report';
                        return '/project/' + params.projectKey
                            + '/' + params.versionName + '/' + defaultTab;
                    }
                })
                .otherwise({
                    redirectTo: '/start'
                });

            /**
             * Managing route segments.
             */
            $routeSegmentProvider
                .when('/start', 'start')
                    .segment('start', {
                        templateUrl: TEMPLATES_URL + '/start.html',
                        controller: 'Start'
                    })
                .when('/performance/:user', 'performance')
                    .segment('performance', {
                        templateUrl: TEMPLATES_URL + '/performance.html',
                        controller: 'Performance',
                        dependencies: ['user']
                    })
                .when('/project/:projectKey', 'project')
                .when('/project/:projectKey/:versionName/confidence_report', 'project.version.confidence_report')
                .when('/project/:projectKey/:versionName/confidence_report/export', 'project.version.confidence_report.export')
                .when('/project/:projectKey/:versionName/resources', 'project.version.resources')
                    .segment('project', {
                        templateUrl: TEMPLATES_URL + '/project.html',
                        controller: 'Project'
                    })
                    .within('project')
                        .segment('overview', {
                            default: true,
                            templateUrl: TEMPLATES_URL + '/project/overview.html'
                        })
                        .segment('version', {
                            templateUrl: TEMPLATES_URL + '/project/version.html',
                            controller: 'Version'
                        })
                        .within('version')
                            .segment('confidence_report', {
                                templateUrl: TEMPLATES_URL +'/project/version/confidence_report.html',
                                controller: 'Version_ConfidenceReport',
                                dependencies: ['projectKey', 'versionName']
                            })
                            .within('confidence_report')
                                .segment('edit', {
                                    default: true,
                                    templateUrl: TEMPLATES_URL +'/project/version/confidence_report/edit.html'
                                })
                                .segment('export', {
                                    templateUrl: TEMPLATES_URL +'/project/version/confidence_report/export.html',
                                    controller: 'Version_ConfidenceReport_Export'
                                })
                                .up()
                            .segment('resources', {
                                templateUrl: TEMPLATES_URL +'/project/version/resources.html',
                                controller: 'Version_Resources',
                                dependencies: ['projectKey', 'versionName']
                            })
                            .up()
                        .up()
                .when('/users', 'users')
                    .segment('users', {
                        templateUrl: TEMPLATES_URL + '/users.html',
                        controller: 'Users'
                    })
                    .within('users')
                        .segment('list', {
                            default: true,
                            templateUrl: TEMPLATES_URL + '/users/list.html'
                        })
            ;

/*
            $routeProvider
                .when('/start', {
                    templateUrl: TEMPLATES_URL + '/start.html',
                    controller: 'Start'
                })
                .when('/version/:projectKey/:versionName', {
                    redirectTo: function(params) {
                        var defaultTab = 'confidence_report';
                        return '/version/' + params.projectKey
                            + '/' + params.versionName + '/' + defaultTab;
                    }
                })
                .when('/version/:projectKey/:versionName/:tab', {
                    templateUrl: TEMPLATES_URL +'/version.html',
                    controller: 'Version'
                })
                .when('/project/:projectKey', {
                    templateUrl: TEMPLATES_URL + '/project.html',
                    controller: 'Project'
                })
                .when('/performance/:user', {
                    templateUrl: TEMPLATES_URL + '/performance.html',
                    controller: 'Performance'
                })
                .otherwise({
                    redirectTo: '/start'
                });
*/
        }]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters']);
angular.module('agile.filters', ['helper', 'ngSanitize']);