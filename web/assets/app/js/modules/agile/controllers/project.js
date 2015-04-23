angular.module('agile.controllers')
    .controller('Project', function($scope, $routeParams, Api, Helper, Config) {

        Config.load($routeParams.projectKey).then(function() {
            loadProject().then(function() {
                Helper.setTitle(Config.value('project_name') || $scope.project.name);
            });
        });

        $scope.Config = Config;
        $scope.config = Config;
        $scope.loadProject = loadProject;
        $scope.userTypes = Helper.getUserTypes();

        $scope.saveProject = function()
        {
            return Api.get('Project')
                .put($scope.project._id, $scope.project)
                .then(function(response) {
                    Helper.setAlert('success', response.message);
                });
        };

        $scope.updateProject = function() {
            Api.get('ProjectsImport').post({
                key: $scope.project.key
            }).then(function(response) {
                Helper.setAlert('success', response.message);
                loadProject();
            });
        };

        function loadProject()
        {
            return Api.get('Project').get($routeParams.projectKey)
                .then(function(project) {
                    $scope.project = project;
                });
        }
    });