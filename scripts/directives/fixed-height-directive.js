/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('fixedHeight', [function (){
    return {
        restrict: 'A',
        link: function ($scope, $element, attrs) {
            var adjust = function () {
                var w_h = $(window).height();
                var top = $element.offset().top;
                $element.height(w_h - top - 50);
            };

            adjust();
            $(window).bind('resize', adjust);

            $element.on('$destroy', function (){
                $(window).unbind('resize', adjust);
            });
        }
    };
}]);
