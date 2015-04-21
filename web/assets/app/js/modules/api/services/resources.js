angular.module('api')

    .factory('ConfigsApi',  function(Factory) {
        return Factory.collection('configs', {id: '@id'});
    })
    .factory('ConfigApi',  function(Factory) {
        return Factory.item('configs/:id', {id: '@id'});
    })

    .factory('ConfidenceReports', function(Factory) {
        return Factory.collection('confidence_reports');
    })
    .factory('ConfidenceReport',  function(Factory) {
        return Factory.item('confidence_reports/:id', {id: '@id'});
    })

    .factory('ResourcesPlans', function(Factory) {
        return Factory.collection('resources_plans');
    })
    .factory('ResourcesPlan',  function(Factory, DateConverter) {
        var api = Factory.item('resources_plans/:id', {id: '@id'});

        var parentGet = api.get;
        api.get = function(query) {
            return parentGet(query).then(function(plan) {
                DateConverter.dateStringToObject(plan, ['startDate', 'releaseDate']);
                return plan;
            });
        };

        return api;
    })

    .factory('Commitments', function(Factory) {
        return Factory.collection('commitments');
    })
    .factory('Commitment', function(Factory, DateConverter) {
        var api = Factory.item('commitments/:id', {id: '@id'});

        var parentGet = api.get;
        api.get = function(query) {
            return parentGet(query).then(function(plan) {
                DateConverter.dateStringToObject(plan, ['startDate', 'releaseDate', 'freezeDate', 'approveTill']);
                return plan;
            });
        };

        return api;
    })

    .factory('Issues', function(Factory) {
        return Factory.collection('issues');
    })
    .factory('Issue',  function(Factory) {
        return Factory.item('issues/:id', {id: '@id'});
    })
    .factory('IssuesImport',  function(Factory) {
        return Factory.collection('issues/import');
    })

    .factory('Projects', function(Factory) {
        return Factory.collection('projects');
    })
    .factory('Project', function(Factory, DateConverter) {
        var projectApi = Factory.item('projects/:id', {id: '@id'});

        var parentGet = projectApi.get;
        projectApi.get = function(query) {
            return parentGet(query).then(function(project) {
                if (project.versions) {
                    project.versions.forEach(function(version) {
                        DateConverter.dateStringToObject(version, ['startDate', 'releaseDate']);
                    });
                }
                return project;
            });
        };

        return projectApi;
    })
    .factory('ProjectsImport',  function(Factory) {
        return Factory.collection('projects/import');
    })

    .factory('Users', function(Factory) {
        return Factory.collection('users');
    })
    .factory('User',  function(Factory) {
        return Factory.item('users/:id', {id: '@id'});
    })
    .factory('UsersImport',  function(Factory) {
        return Factory.collection('users/import');
    })

    .factory('JiraIssueTypes', function(Factory) {
        return Factory.collection('jira/issue_types');
    })
    .factory('JiraIssues', function(Factory) {
        return Factory.collection('jira/issues');
    })
    .factory('JiraIssue',  function(Factory) {
        return Factory.item('jira/issues/:id', {id: '@id'});
    })

    .factory('JiraProjects', function(Factory) {
        return Factory.collection('jira/projects');
    })
    .factory('JiraProject',  function(Factory) {
        return Factory.item('jira/projects/:id', {id: '@id'});
    })

    .factory('JiraUsers', function(Factory) {
        return Factory.collection('jira/users');
    })
    .factory('JiraUser',  function(Factory) {
        return Factory.item('jira/users/:id', {id: '@id'});
    })
;