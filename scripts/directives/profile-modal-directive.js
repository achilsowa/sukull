/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('profileModal', [function() {
    return {
        templateUrl: 'views/profile-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'username': 'username',
                'Edit': 'Edit',
                'Edit picture': 'Edit picture',
                'Edit password': 'Edit password',
                'Member since': 'Member since',
                'Teacher at': 'Teacher at',
                'old password': 'old password',
                'new password': 'new password',
                'new password again': 'new password again',
                'Close': 'Close',
                'Save': 'Save',
                'Edit or Profile': 'Change password'
            };

            $scope.more = false;

            $scope.toggleEdit = function () {
                $scope.more = !$scope.more;
                $scope.strs['Edit or Profile'] = ($scope.more ? 'Profile' : 'Change password');
            };

            $scope.submit = function() {
                $scope.editpwd({old:$scope.oldpwd, new1:$scope.newpwd, new2:$scope.newpwd2});
                $scope.oldpwd = $scope.newpwd = $scope.newpwd2 = '';
            };


            var input_file = angular.element('form[name="tofForm"] input[type="file"]');
            input_file.bind('change', function () {
                console.log(input_file.val());
                if (!input_file.get(0).files[0])
                    return;
                $scope.edittof({file: input_file.get(0).files[0], type:1});
            });
            $scope.submitTof = function () {
                input_file.trigger('click');
            };

        },
        scope: {
            user: '=',
            working:'=',
            error:'=',
            editpwd: '&',
            edittof: '&'
        }
    };
}]);
