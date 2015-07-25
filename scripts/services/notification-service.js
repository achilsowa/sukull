/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('NotificationService', ['Strophe', 'PubSubService', 'RegisterService', 'Helper', '$q', '$rootScope',  function (Strophe, Pubsub, Register, Helper, $q, $rootScope){
    
    var Notification = {
        olds: [],
        items: []
    };


    Notification.conn = Pubsub.conn;

    Notification.notify = function (jid, content) {
        jid = Strophe.getNodeFromJid(jid);
        console.log('users-'+jid, content);
        return Pubsub.publish('users-'+jid, content);
	};

    Notification.init = function (jid) {
        Notification.node = 'users-'+Strophe.getNodeFromJid(jid);
        console.log(Notification.node);
        Pubsub.subs[Notification.node] = Notification.items;
    }


    Notification.getNotifications = function (max, forceReload) {
        if (!max) max = 5;
        var d = $q.defer();
        if (!Notification.node) {
            d.reject();
            return d.promise;
        }

        if (Notification.loadedComments && !forceReload){
            d.resolve();
            return d.promise;
        }
        console.log(Notification.node);
        Pubsub.getItems(Notification.node, max).then(
            function(items) {
                $(items).find('item').each(
                    function(){
                        var item = JSON.parse($(this).find('body').text());
                        item.jiid = $(this).attr('id');
                        var index = -1;
                        for (var i=0; i<Notification.olds.length; ++i) {
                            if (Notification.olds[i].jiid == item.jiid) {
                                index = i;
                                break;
                            }
                        }
                        console.log(index, item);
                        if (index > -1) Notification.olds[index] = item;
                        else Notification.olds.unshift(item);
                    }
                );
                Notification.loadedComments = true;
                d.resolve(items);
            },
            function(e){
                console.log(e);
                d.reject(e);
            }
        );
        return d.promise;
    };

    Notification.readNotifications = function () {
        var d = $q.defer();
        if (Notification.olds.length == 0) d.resolve();

        var errors = [], reps = [];
        for (var i= 0, length = Notification.olds; i<Notification.olds.length; ++i) {
            var item = Notification.olds[i];
            item.type = 'read';
            console.log(item);
            Pubsub.publish(Notification.node, item).then(
                function(iq) {
                    reps.push(iq);
                    if (--length == 0){
                        if (errors.length == 0) d.resolve(reps); else d.reject(errors);
                    }
                },
                function (e) {
                    e = {msg:e, index: length};
                    errors.push(e);
                    if (--length == 0) d.reject(erros); else return e;
                }
            );
        }
    };

    window.notif = Notification;
    return Notification;
}]);

