angular.module('agile.directives')
    .directive('updateModelOnEnter', function() {
        /**
         * @see: http://toresenneseth.wordpress.com/2014/08/10/update-the-model-on-enter-key-pressed-with-angularjs/
         */
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, attrs, ngModelCtrl) {
                $element.bind('keydown', function(e) {
                    if (e.keyCode === 13) {
                        ngModelCtrl.$commitViewValue();
                        $scope.$digest();
                    }
                });
            }
        }
    });