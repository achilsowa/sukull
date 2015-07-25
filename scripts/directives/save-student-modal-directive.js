/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveStudentModal', [function() {
    return {
        templateUrl: 'views/save-student-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
                $scope.save();
            };
        },
        scope: {
            student: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
