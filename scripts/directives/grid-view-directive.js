/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('gridView', ['Helper', function(Helper) {
    return {
        templateUrl: 'views/grid-view.html',
        restrict:'A',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Open': 'Open',
                'Edit': 'Edit',
                'Delete': 'Delete'
            };

            for(var i=0; i<$scope.headers.length; ++i) {
                if (!$scope.headers[i].name)
                    throw('name is required for each header') ;
                $scope.headers[i].index = $scope.headers[i].index || $scope.headers[i].name;
            }

            $scope.click_hdl = function(item) {
                item.selected = !item.selected;
            };

            $scope.open_hdl = function (item){
                $scope.open({item:item});
            };

            $scope.edit_hdl = function (item){
                $scope.edit({item:item});
            };

            $scope.remove_hdl = function (item){
                $scope.remove({item:item});
            };

            $scope.present = Helper.truncate;
        },
        scope: {
            icon: '=',
            headers: '=',
            items: '=',
            open:'&',
            edit:'&',
            remove:'&'
        }
    };
}]);
