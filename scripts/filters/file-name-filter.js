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
