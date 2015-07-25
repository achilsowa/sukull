/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('excelView', ['ExcelViewService', 'ExcelColumnViewService', function(ExcelView, Column) {
    return {
        templateUrl: 'views/excel-view.html',
        restrict:'AE',
        scope: {
            headers: '=',
            viewId:'@',
            model:'='
        },

        controller: function($scope, $element, $attrs) {

            $scope.strs = {
                'Undo': 'Undo',
                'Redo': 'Redo',
                'Cut': 'Cut',
                'Copy': 'Copy',
                'Paste': 'Paste',
                'Remove row': 'Remove row',
                'Remove column': 'Remove column',
                'Insert': 'Insert',
                'Edit': 'Editx',
                'Insert graphic': 'Insert graphic',
                'Insert row': 'Insert row',
                'Insert column': 'Insert column'
            };

            $element.attr('id', $scope.viewId);
            this.view = new ExcelView({el: $element, headers:$scope.headers});
            this.state = $scope.state = this.view.state;

            console.log(this.state);
            console.log('END');
            this.view.setModel($scope.model);
        }
    };
}]);
