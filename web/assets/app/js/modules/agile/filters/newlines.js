angular.module('agile.filters')
    .filter('newlines', function($sce) {
        return function(text) {
            return $sce.trustAsHtml((text || '').replace(/\n/g, '<br/>'));
        };
    });