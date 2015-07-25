/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('Strophe', [function (){
    var Xmpp = Strophe;
    Xmpp.BOSH_SERVICE = 'http://localhost:5280/http-bind';
    Xmpp.ServerAddr = 'localhost';
    return Xmpp;
}]);
