/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('shareEltModal', [function() {
    return {
        templateUrl: 'views/share-elt-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
		console.log($scope.email);
                $scope.share({email:$scope.email});
            };
        },
        scope: {
            elt: '=',
            working:'=',
            error:'=',
            share: '&'
        }
    };
}]);
