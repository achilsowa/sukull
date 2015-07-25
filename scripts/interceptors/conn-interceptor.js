/**
 * Created by tchapda gabi on 22/06/2015.
 */

sukuApp.factory('ConnInterceptor', ['$q', function ($q){
    return {
        response: function (resp){
            angular.element('.conn-error-alert').removeClass('active');
            return $q.when(resp);
        },
        responseError: function (reject){
            if (reject.status == 0) {
                var alert = angular.element('#conn-error-alert');
                alert.clone().addClass('active').removeAttr().appendTo('body');
                console.log(reject);
            }
            return $q.reject(reject);
        }
    };
}]).config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('ConnInterceptor');
}]);

