angular.module('agile.filters')
    .value('storyKeyRegexp', '([A-Z]+\-?([A-Z]+\-)?[0-9]+([a-z])?)')
    .filter('storyKey', function($sce, storyKeyRegexp) {
        return function(input, noSummary) {
            input = input || '';
            var html = input.replace(
                new RegExp('^' + storyKeyRegexp + '([^a-z].*)$'),
                noSummary ? '<em>$1</em>' : '<em>$1</em>$4'
            );
            if (noSummary && html == input) {
                return '';
            }
            return $sce.trustAsHtml(html);
        };
    })
    .filter('noStoryKey', function(storyKeyRegexp) {
        return function(input) {
            input = input || '';
            return input.replace(new RegExp('^' + storyKeyRegexp + '[^a-z]\s*(.*)$'), '$4').trim();
        };
    })
    .filter('onlyStoryKey', function(storyKeyRegexp) {
        return function(input) {
            input = input || '';
            var regexp = new RegExp('^' + storyKeyRegexp + '[^a-z].*');
            if (regexp.test(input)) {
                return input.replace(regexp, '$1');
            }
            return '';
        };
    });