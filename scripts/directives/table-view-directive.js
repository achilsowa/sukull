/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('tableView', [function() {
    return {
        templateUrl: 'views/table-view.html',
        restrict:'AE',
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

            $scope.deselect = function () {
                for(var i=0; i<$scope.items.length; ++i) {
                    $scope.items[i].selected = false;
                    var item = $scope.items[i];
                }
            };

            $scope.open_hdl = function (item){
                console.log(item);
                $scope.open({item:item});
            };

            $scope.edit_hdl = function (item){
                $scope.edit({item:item});
            };

            $scope.remove_hdl = function (item){
                $scope.remove({item:item});
            };

            $element.bind('click', function(evt){
                if (evt.target.tagName == 'TBODY') $scope.deselect();
            });
        },
        scope: {
            icon: '=',
            headers: '=',
            items: '=',
            edit:'&',
            open:'&',
            remove:'&'
        }
    };
}]);
