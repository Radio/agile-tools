angular.module('api')
    .factory('DateConverter', function() {
        return {
            dateStringToObject: function(item, properties) {
                properties.forEach(function(property) {
                    if (typeof item[property] == 'object' && typeof item[property].date == 'string') {
                        try {
                            var dateTime = item[property].date.split(' ');
                            var d = dateTime[0].split('-');
                            var t = dateTime[1].split(':');
                            item[property] = new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2], 0);
                        } catch (e) {
                            item[property] = new Date(item[property]);
                        }
                    }
                });
            },
            dateObjectToString: function(item, properties, format) {
                format = format || 'YYYY-MM-DD HH:mm:ss';
                properties.forEach(function(property) {
                    if (typeof item[property] == 'object' && typeof item[property].getDate == 'function') {
                        item[property] = moment(item[property]).format(format);
                    }
                });
            }
        }
    });