angular.module('agile.controllers')
    .controller('Projects', function($scope, Projects, Helper) {

        Helper.setTitle('Projects');

        Projects.get()
            .then(function(projects) {
                $scope.projects = projects;
            });
    });