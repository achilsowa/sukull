/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('datepicker', [function (){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, $element, attrs, ngModelCtrl) {
            var options = {
                todayBtn: "linked",
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: true,
                autoclose: true
            };
            $element.datepicker(options);

            //when data changes outside of AngularJS notify the third party directive of the change
            ngModelCtrl.$render = function () {
                $element.val(ngModelCtrl.$viewValue);
            };

            //when data changes outside angular js
            $element.on('set', function (args){
                //tell angular js that it needs to update the ui
                $scope.$apply(function (){
                    ngModelCtrl.$setViewValue($element.val());
                });
            });
        }
    };
}]);
