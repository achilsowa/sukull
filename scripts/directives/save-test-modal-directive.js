/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveTestModal', [function() {
    return {
        templateUrl: 'views/save-test-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
                $scope.save();
            };


        },
        scope: {
            test: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
