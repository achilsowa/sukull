/**
 * Created by achil on 7/10/15.
 */

sukuApp.filter('tr', ['TranslateService', function (Translate){

    return function (msg) {
        return Translate.tr(msg);
    };

}]);
