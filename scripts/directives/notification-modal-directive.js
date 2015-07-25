/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('notificationModal', ['$location', function($location) {
    return {
        templateUrl: 'views/notification-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.$watch('notifications.length', function (){
                if ($scope.notifications.length == 0) return;
                if (!$scope.newno) $scope.newno = !$scope.newno;
            });

            $scope.open = function (notif) {
                if (notif.link) {
                    $element.modal('hide');
                    $location.path(notif.link);
                }
            }

            $scope.strs = {
                'Five things you may have missed': 'Five things you may have missed'
            }
        },
        scope: {
            notifications:'=',
            newno:'=',
            olds:'='
        }
    };
}]);
