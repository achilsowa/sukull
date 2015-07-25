/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('excelColumn', ['ExcelColumnViewService', function (Column){
    return {
        restrict: 'A',

        required:'^excelView',

        scope:{
            header: '=',
            formula:'=',
            items: '='
        },

        link: function ($scope, $element, attrs, view) {
            $scope.header.index = $scope.header.index || $scope.header.name;
            var col = new Column({name:$scope.header.name, index:$scope.header.index, items:$scope.items, formula:$scope.formula, view:view});
        }
    };
}]);
