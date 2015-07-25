/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveClassroomModal', [function() {
    return {
        templateUrl: 'views/save-classroom-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Name': 'Name',
                'School': 'School',
                'classroom name': 'classroom name',
                'school name': 'school name',
                'Close': 'Close',
                'Save': 'Save'
            };

            $scope.submit = function() {
                $scope.save();
            };
        },
        scope: {
            classroom: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
