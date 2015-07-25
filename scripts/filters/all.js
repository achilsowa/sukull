/**
 * Created by achil on 7/10/15.
 */

sukuApp.filter('name', [function (){

    return function (link) {
        var name = link.split('_');
        if (name.length < 2) return link;
        if (name.length > 2)  for (var i= 2, max=name.length; i<max; ++i) name[1] += '_'+name[i];
        return name[1];
    };

}]);
/**
 * Created by achil on 7/10/15.
 */

sukuApp.filter('type', [function (){

    return function (link) {
        var name = link.split('.');
        if (name.length == 0) return 'file';
        var ext = name[name.length-1];

        if (ext == 'pdf') return 'file-pdf';
        if (ext == 'txt' || ext == 'text') return 'file-text';
        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg' || ext == 'bmp' || ext == 'gif') return 'file-picture';
        if (ext == 'zip') return 'file-zip';
        if (ext == 'docx' || ext == 'doc' || ext == 'odt') return 'file-word';
        if (ext == 'xlsx' || ext == 'xls' || ext == 'ods') return 'file-excel';
        if (ext == 'pptx' || ext == 'ppt' || ext == 'odp') return 'file-powerpoint';
        return 'file';
    };

}]);
/**
 * Created by achil on 7/10/15.
 */

sukuApp.filter('tr', ['TranslateService', function (Translate){

    return function (msg) {
        return Translate.tr(msg);
    };

}]);
