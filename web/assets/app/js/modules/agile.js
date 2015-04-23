angular.module('agile', [
    'ngRoute',
    'agile.controllers',
    'agile.filters',
    'agile.services',
    'route-segment',
    'view-segment',
    'ui.sortable',
    'templates'
]);

angular.module('agile.controllers', ['helper', 'api', 'agile.filters', 'agile.directives']);
angular.module('agile.filters', ['helper', 'ngSanitize']);
angular.module('agile.directives', ['helper', 'ngSanitize', 'agile.filters']);
angular.module('agile.services', ['helper']);