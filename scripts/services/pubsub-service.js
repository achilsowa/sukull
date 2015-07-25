/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('PubSubService', ['Strophe', 'RegisterService', '$q', '$rootScope',  function (Strophe, Register, $q, $rootScope){
    
    var Pubsub = {
	    NS_DATA_FORMS : "jabber:x:data",
	    NS_PUBSUB : "http://jabber.org/protocol/pubsub",
	    NS_PUBSUB_OWNER : "http://jabber.org/protocol/pubsub#owner",
	    NS_PUBSUB_ERRORS : "http://jabber.org/protocol/pubsub#errors",
	    NS_PUBSUB_NODE_CONFIG : "http://jabber.org/protocol/pubsub#node_config",
	    items : [],
	    subs: {},
        handlers:[],
        resource: 'web'
    };
    
    Pubsub.conn = Register.conn;
    Pubsub.service = 'pubsub.'+Strophe.ServerAddr;


    Pubsub.sendIQq = function (iq) {
	    var d = $q.defer();
	    Pubsub.conn.sendIQ(iq, function (iq){d.resolve(iq);}, function (error) {d.reject(error)});
	    return d.promise;
    };

    Pubsub.createNode = function(node) {
        var iq = $iq({to: Pubsub.service, type: 'set'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
    	    .c('create', {node:node})
	        .up()
	        .c('configure')
    	    .c('x', {xmlns:Pubsub.NS_DATA_FORMS, type:'submit'})
	        .c('field', {'var': 'FORM_TYPE'})
	        .c('value').t(Pubsub.NS_PUBSUB_NODE_CONFIG)
    	    .up().up()
	        .c('field', {'var': 'pubsub#send_last_published_item'})
	        .c('value').t("never")
    	    .up().up()
	        .c('field', {'var': 'pubsub#publish_model'})
	        .c('value').t("open")
    	    .up().up()
	        .c('field', {'var': 'pubsub#expire_time'})
	        .c('value').t("31536000")
            .up().up()
            .c('field', {'var': 'pubsub#max_items'})
	        .c('value').t("1000");

	    return Pubsub.sendIQq(iq).then(function(){
            return Pubsub.subscribe(node);
	    });
    };
    
    Pubsub.deleteNode = function(node) {
	    var iq = $iq({to: Pubsub.service, type: 'set'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB_OWNER})
	        .c('delete', {node: node});
	
	    return Pubsub.sendIQq(iq);
    };

    Pubsub.configureNode = function(node) {
	
    };

    Pubsub.publish = function (node, item) {
        if (!item.jiid)
	        item.from = {name:Register.user.name, jid:Register.user.jid,img:Register.user.img, schools:Register.user.schools,
                         creation:Register.user.creation};
        item.date = new Date();
        if (!item.what) item.what = 'comment';

	    var iq;
        if (item.jiid) {
            iq = $iq({to: Pubsub.service, type: 'set'})
	            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
    	        .c('publish', {node: node})
	            .c('item', {id: item.jiid})
	            .c('entry', {xmlns:'http://www.w3.org/2005/Atom'})
	            .c('body').t(JSON.stringify(item));
        }else {
            iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('publish', {node: node})
                .c('item')
                .c('entry', {xmlns:'http://www.w3.org/2005/Atom'})
                .c('body').t(JSON.stringify(item));
        }

        return Pubsub.sendIQq(iq);
    };


    Pubsub.deleteItem = function (node, item_id) {
	
    };

    Pubsub.getItems = function (node, max) {
        var iq;
        if (max) iq = $iq({to: Pubsub.service, type: 'get'})
	                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
	                .c('items', {node: node, 'max_items': max});

        else  iq = $iq({to: Pubsub.service, type: 'get'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('items', {node: node});
	    return Pubsub.sendIQq(iq);
    };


    Pubsub.subscribe = function (node) {
	    if (Pubsub.resource && Strophe.getResourceFromJid(Pubsub.conn.jid) != Pubsub.resource) {
            var jid = Strophe.getBareJidFromJid(Pubsub.conn.jid)+'/'+Pubsub.resource;
            var iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('subscribe', {node: node, jid: jid});
            Pubsub.sendIQq(iq);
        }

        var iq = $iq({to: Pubsub.service, type: 'set'})
            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
            .c('subscribe', {node: node, jid: Pubsub.conn.jid});

	    return Pubsub.sendIQq(iq);
    };

    Pubsub.unsubscribe = function (node) {
        if (Pubsub.resource && Strophe.getResourceFromJid(Pubsub.conn.jid) != Pubsub.resource) {
            var jid = Strophe.getBareJidFromJid(Pubsub.conn.jid)+'/'+Pubsub.resource;
            var iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('unsubscribe', {node: node, jid: jid});
            Pubsub.sendIQq(iq);
        }

        var iq = $iq({to: Pubsub.service, type: 'set'})
            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
            .c('unsubscribe', {node: node, jid: Pubsub.conn.jid});

        return Pubsub.sendIQq(iq);
    };

    Pubsub.getSubscriptions = function (node) {
	    var iq = $iq({to: Pubsub.service, type: 'get'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB_OWNER})
	        .c('subscriptions', {node: node});
	    return Pubsub.sendIQq(iq);
    };
    
    Pubsub.getSubscriptionConfig = function (node) {
	    var iq = $iq({to: Pubsub.service, type: 'get'})
    	    .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
	        .c('options', {node: node, jid: Strophe.getBareJidFromJid(Pubsub.conn.jid)});
	    return Pubsub.sendIQq(iq);
    };

    Pubsub.addHandler = function (handler) {
        Pubsub.handlers.push(handler);
    };

    Pubsub.new_item = function (item) {
        console.log(item);
        var jitem = $(item).find('body').text();
        var item_id = $(item).attr('id');
        var node = $(item).find('items').attr('node');
        if (!jitem) return true;
        jitem = JSON.parse(jitem);
        jitem.jiid = item_id;
        $rootScope.$apply(function() {
            notifyng(jitem, node);
        });
	    return true;
    };

        
    Pubsub.conn.addHandler(Pubsub.new_item, null, "message", null, null, Pubsub.service);
    

    var notifyng = function (jitem, node) {
        if (!Pubsub.subs[node]) Pubsub.subs[node] = [];
        Pubsub.subs[node].unshift(jitem);
        Pubsub.items.unshift(jitem);
        return true;
    };

    window.pubsub = Pubsub;
    return Pubsub;
}]);

