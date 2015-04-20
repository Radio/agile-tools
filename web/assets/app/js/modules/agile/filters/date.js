angular.module('agile.filters')
    .filter('dateFormat', [function() {
        return function(date, format) {
            if (date) {
                date = (date === 'now' ? undefined : date);
                return moment(date).format(format);
            } else {
                return null;
            }
        }
    }])
    .filter('dateDiff', [function() {
        return function(date1, date2) {
            var date1Format = String(date1).indexOf('.') > 0 ? 'DD.MM.YYYY' : 'YYYY-MM-DD';
            var date2Format = String(date2).indexOf('.') > 0 ? 'DD.MM.YYYY' : 'YYYY-MM-DD';
            if (date1 && date2) {
                date1 = (date1 === 'now' ? moment() : moment(date1, date1Format));
                date2 = (date2 === 'now' ? moment() : moment(date2, date2Format));
                return date1.businessDiff(date2);
            } else {
                return null;
            }
        }
    }]);