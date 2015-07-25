/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('authModal', [function() {
    return {
        templateUrl: 'views/auth-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Your are not authenticated or your session has ended': 'Your are not authenticated or your session has ended',
                'Please sign in again': 'Please sign in again',
                'Close': 'Close',
                'Sign in': 'Sign in'
            };
        }
    };
}]);
