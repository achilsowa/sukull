/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('chartView', ['ChartViewService', function(ChartDialog) {
    return {
        templateUrl: 'views/chart-view.html',
        restrict:'AE',
        scope : {
            meta: '='
        },
        require: '?^excelView',

        link: function($scope, $element, $attrs, excelCtrl) {
            $scope.strs = {
                'Chart Editor': 'Chart Editor',
                'Data range': 'Data range',
                'Graphic type': 'Graphic type',
                'Column': 'Column',
                'Line': 'Line',
                'Polar-Area': 'Polar-Area',
                'Radar': 'Radar',
                'Pie, Doughnut': 'Pie, Doughnut',
                'Data series in rows': 'Data series in rows',
                'Data series in columns': 'Data series in columns'
            };


            var chart;
            if (excelCtrl)
                chart = new ChartDialog({view:excelCtrl.view, el: $element});

            else
                chart = new ChartDialog({meta:$scope.meta, el: $element});


            console.log(excelCtrl.state);
        }
    };
}]);
