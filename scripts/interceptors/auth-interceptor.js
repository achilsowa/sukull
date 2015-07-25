/**
 * Created by tchapda gabi on 22/06/2015.
 */

sukuApp.factory('AuthInterceptor', ['$q', function ($q){
    return {
      responseError: function (reject){
          if (reject.status == 400) {
              var dialog = angular.element('#auth-modal');
              dialog.modal();
              console.log(reject);
          }
          return $q.reject(reject);
      }
    };
}]).config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
}]);

