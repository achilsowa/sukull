/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('inviteUserModal', [function() {
    return {
        templateUrl: 'views/invite-user-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.strs = {
                'Email': 'Email',
                'Enter your colleague\'s email': 'Enter your colleague\'s email',
                'You may want to share some of your classroom with him': 'You may want to share some of your classroom with him',
                'Close': 'Close',
                'Invite': 'Invite'

            }
            $scope.submit = function() {
		        console.log($scope.email);
                $scope.invite({email:$scope.email});
            };
        },
        scope: {
            classrooms: '=',
            working:'=',
            error:'=',
            invite: '&'
        }
    };
}]);
