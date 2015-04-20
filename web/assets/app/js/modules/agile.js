angular.module('agile', [
        'ngRoute',
        'agile.controllers',
        'agile.filters',
        'agile.services',
        'route-segment',
        'view-segment',
        'ui.sortable'
    ])
    .constant('TEMPLATES_URL', '/assets/app/templates')
    .config(['$routeProvider', '$routeSegmentProvider', '$locationProvider', 'TEMPLATES_URL',
        function($routeProvider, $routeSegmentProvider, $locationProvider, TEMPLATES_URL) {

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            /**
             * Managing redirects through native $routeProvider.
             */
            $routeProvider
                .when('/project/:projectKey/version/:versionName', {
                    redirectTo: function(params) {
                        var defaultTab = 'confidence_report';
                        return '/project/' + params.projectKey
                            + '/version/' + params.versionName + '/' + defaultTab;
                    }
                })
                .otherwise({
                    redirectTo: '/projects'
                });

            /**
             * Managing route segments.
             */
            $routeSegmentProvider
                .when('/start', 'start')
                    .segment('start', getSegmentParams('Start', '/start.html', true))
                .when('/performance/:user', 'performance')
                    .segment('performance', getSegmentParams('Performance', '/performance.html', true, false, ['user']))
                .when('/project/:projectKey', 'project')
                .when('/project/:projectKey/team', 'project.team')
                .when('/project/:projectKey/version/:versionName/confidence_report', 'project.version.confidence_report')
                .when('/project/:projectKey/version/:versionName/confidence_report/export', 'project.version.confidence_report.export')
                .when('/project/:projectKey/version/:versionName/resources', 'project.version.resources')
                .when('/project/:projectKey/version/:versionName/resources/export', 'project.version.resources.export')
                    .segment('project', getSegmentParams('Project', '/project.html', true))
                    .within('project')
                        .segment('overview', getSegmentParams(null, '/project/overview.html', false, true))
                        .segment('team', getSegmentParams('Team', '/project/team.html', false, false))
                        .segment('version', getSegmentParams('Version', '/project/version.html'))
                        .within('version')
                            .segment('confidence_report', getSegmentParams('Version_ConfidenceReport', '/project/version/confidence_report.html', false, false, ['projectKey', 'versionName']))
                            .within('confidence_report')
                                .segment('edit', getSegmentParams(null, '/project/version/confidence_report/edit.html', false, true))
                                .segment('export', getSegmentParams('Version_ConfidenceReport_Export', '/project/version/confidence_report/export.html'))
                            .up()
                            .segment('resources', getSegmentParams('Version_Resources', '/project/version/resources.html', false, false, ['projectKey', 'versionName']))
                            .within('resources')
                                .segment('edit', getSegmentParams(null, '/project/version/resources/edit.html', false, true))
                                .segment('export', getSegmentParams('Version_Resources_Export', '/project/version/resources/export.html'))
                                .up()
                            .up()
                        .up()
                .when('/users', 'users')
                    .segment('users', getSegmentParams('Users', '/users.html', true))
                .when('/projects', 'projects')
                    .segment('projects', getSegmentParams('Projects', '/projects.html', true))
                .when('/config', 'config')
                .when('/config/:projectKey', 'config.project')
                    .segment('config', getSegmentParams('Config', '/config.html', true, false))
                    .within('config')
                        .segment('global', getSegmentParams(null, '/config.html', false, true))
                        .segment('project', getSegmentParams(null, '/config.html', false, false, ['projectKey']))
                        .up()
                .when('/login', 'login')
                    .segment('login', getSegmentParams('Login', '/login.html'))
            ;

            /**
             * Segment params factory function.
             */

            function getSegmentParams(controller, template, isSecure, isDefault, dependencies)
            {
                var params = {
                    templateUrl: TEMPLATES_URL + template,
                    default: isDefault,
                    dependencies: dependencies
                };
                if (controller) {
                    params.controller = controller;
                }
                if (isSecure) {
                    params.resolve = {
                        auth: ['Auth', function(Auth) {
                            return Auth.check();
                        }]
                    };
                    params.resolveFailed = getSegmentParams('Login', '/login.html');
                }
                return params;
            }
        }]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters', 'agile.directives']);
angular.module('agile.filters', ['helper', 'ngSanitize']);
angular.module('agile.directives', ['helper', 'ngSanitize', 'agile.filters']);
angular.module('agile.services', ['helper']);