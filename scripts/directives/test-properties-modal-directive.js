/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('testPropertiesModal', [function() {
    return {
        templateUrl: 'views/test-properties-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.strs = {
                'Properties': 'Properties',
                'Effectif': 'Effectif',
                'Male': 'Male',
                'Female': 'Female',
                'Attachments': 'Attachments',
                'Attach a file': 'Attach a file',
                'Activity': 'Activity',
                'comment': 'comment',
                'Comment': 'Comment',
                'Download': 'Download'
            };

            $scope.submit = function() {
                $scope.publish({comment:$scope.comment});
                $scope.comment = null;
            };



            var input_file = angular.element('form[name="fileForm"] input[type="file"]');
            input_file.bind('change', function () {
                console.log(input_file.val());
                if (!input_file.get(0).files[0])
                    return;
                $scope.addfile({file: input_file.get(0).files[0]});
            });
            $scope.submitFile = function () {
                input_file.trigger('click');
            };
        },
        scope: {
            files:'=',
            comments:'=',
            olds:'=',
            files: '=',
            properties:'=',
            working:'=',
            error:'=',
            publish: '&',
            addfile: '&'
        }
    };
}]);
