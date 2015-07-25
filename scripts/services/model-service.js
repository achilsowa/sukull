/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.factory('Model', ['$q', '$http', 'PubSubService', 'NotificationService', 'trFilter', function($q, $http, Pubsub, Notification, tr){
    var Model = Spine.Model;

    Model.all = {};
    var Passive_save = {
        pupdate : function(options) {
            var clone, records;
            records = this.constructor.irecords;
            records[this.id].load(this.attributes());
            this.constructor.sort();
            clone = records[this.id].clone();
            return clone;
        },

        pcreate : function(options) {
            var clone, record;
            this.id || (this.id = this.cid);
            record = this.dup(false);
            this.constructor.addRecord(record);
            this.constructor.sort();
            clone = record.clone();

            return clone;
        },

        psave : function(options) {
            var error, record;
            if (options == null) {
                options = {};
            }
            if (options.validate !== false) {
                error = this.validate();
                if (error) {
                    this.trigger('error', error);
                    return false;
                }
            }
            record = this.isNew() ?
                this.pcreate(options) : this.pupdate(options);
            this.stripCloneAttrs();
            return record;
        }
    };

    Local_save = {};
    Local_save.lupdate = Spine.Model.prototype.update;
    Local_save.lsave = Spine.Model.prototype.save;
    Local_save.lcreate = Spine.Model.prototype.create;

    var AbstractModel_i = {
        to_json_str : function () {
            var attrs = this.constructor.attributes;
            var str = '{';
            for(i=0; i<attrs.length; ++i) {
                str += '"'+attrs[i]+'": "'+this[attrs[i]]+'"';
                if (i < attrs.length -1) str += ','
            }
            str += '}';
            return str;
        },

        to_http_str : function () {
            var attrs = this.constructor.attributes;
            var ss_attrs = [];
            for(i=0; i<attrs.length; ++i)
                if (this.constructor.is_ssa(attrs[i])) ss_attrs.push(attrs[i]);

            var str = '';
            for(i=0; i<ss_attrs.length; ++i) {
                str += ss_attrs[i]+'='+this[ss_attrs[i]];
                if (i < ss_attrs.length -1) str += '&'
            }
            return str;
        }
    };

    var AbstractModel_e = {
        find_by_sid : function (sid) {console.log(this.sids, sid, this.sids[sid]);
            if (this.sids) return this.sids[sid];
            return this.findByAttributes('sid', sid);
        }
    };


    var Server_destroy = {
        sdestroy: function () {
            var that = this;
            var url = this.constructor.url('destroy');

            var d = $q.defer();
            $http.get(url+'/'+this.sid).then(
                function (resp) {
                    var rep = resp.data;
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0){
                        d.reject(rep);
                    }
                    code = parseInt(rep.content);

                    if (code != 1) {
                        d.reject({msg:'Unable to delete item'});
                        return;
                    }

                    if (!that.constructor.mustHaveNode) {
                        d.resolve();
                        that.destroy();
                        return;
                    }
                    that.unsubscribe().then(function (){
                        console.log('ok unsubscribe');
                        d.resolve();
                        that.destroy();
                        return;
                    },function (e) {d.reject(e);});

                },function (e) {d.reject(e);}
            );

            return d.promise;
        }
    };
    var Server_save = {
        activate: function () {
            var M = this.constructor;
            var that = this;
            $http.post(M.url('activate')+'/'+this.sid).then(
                function() {
                    Pubsub.subscribe(M.Name+'-'+that.sid).then(function () {
                        Pubsub.getItems(M.Name+'-'+that.sid);
                    });
                    console.log('ok');
            });
        },

        save: function () {
            var url = this.constructor.url('save');
            var that = this;
            var msg = 'saving ' + (this.name || this.code || 'item');
            var url = this.sid ? url+'/'+this.sid : url+'/0';
            var response = $q.defer();
            if (this.validate()){
                console.log('lsave failed');
                response.reject({what:1, msg:this.validate()});
                return response.promise;
            }
    	    var first = !this.sid;
            console.log(url, this);
            $http.post(url, this).then(
                function(server_response) {
                    var rep = server_response.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);

                    if (rep.status != 0) {
                        that.destroy();
                        response.reject({what:2, msg:'bad id'});
                    }

                    var sid = rep.content;
                    console.log(sid);
                    that.sid = sid;
                    that.psave();
	            	if (that.constructor.mustHaveNode && first) {
			            Pubsub.createNode(that.node()).then(
				            function(){
                                that.comments = Pubsub.subs[that.node()] = [];
                                response.resolve(sid);
                            },
				            function(){ response.reject({what:13, msg:'unable to create node'}); }
			            );
			        }else {
                        response.resolve(sid);
			        }

                },
                function(error) {
                    response.reject(error);
                });
            return response.promise;
        }
    };

    var Server_fetch = {
        isFetched: false,
        isLoading: false,

        fetch : function (forceReload) {
            var url = this.url('fetch');

            var that = this;
            var response = $q.defer();
            if (this.isLoading) {
                response.reject({id:5, msg:'is already fetching'});
                return response.promise;
            }

            this.isLoading = true;

            if (this.isFetched && !forceReload) {
                response.resolve();
                this.isLoading = false;
                return response.promise;
            }
            console.log(url);
            $http.get(url).then(
                function(server_response) {
                    var rep = server_response.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0) {
                        response.reject(rep);
                        that.isFetched = false;
                        that.isLoading = false;
                        return;
                    }
                    var items = rep.content;

                    var active;
                    for(var i=0, max = items.length; i<max; ++i){
                        active = items[i].active;
                        console.log(items[i]);
                        var item = new that(items[i]);
                        if (!item.psave()) continue;
                        if (that.mustHaveNode) {
                            item.comments = Pubsub.subs[item.node()] = [];
                            console.log(active);
                            if (active == '2') item.activate();
                        }
                    }
                    response.resolve(items);
                    that.isFetched = true;
                    that.isLoading = false;
                },
                function(error) {
                    that.isFetched = false;
                    that.isLoading = false;
                    console.log(error);
                    response.reject(error);
                });
            return response.promise;
        },

        /*risk with managing forceReload coz the items will be duplicated*/
        fetch_one : function (sid, forceReload) {

            var url = this.url('fetch_one') + '/'+sid;
            var that = this;
            var response = $q.defer();
            console.log('fetch-one', url);
            if (!forceReload) {
                var item = that.find_by_sid(sid);
                if (item) {
                    response.resolve(item);
                    return response.promise;
                }
            }

            $http.get(url).then(
                function(resp) {
                    var rep = resp.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0) {
                        response.reject(rep);
                        return;
                    }
                    var item = rep.content;
                    console.log(item);

                    var active = item.active;
                    item = new that(item);
                    item.psave();
                    if (that.mustHaveNode) {
                        item.comments = Pubsub.subs[item.node()] = [];
                        console.log(active);
                        if (active == '2') item.activate();
                    }
                    response.resolve(item);
                },
                function(error) {
                    response.reject(error);
                });
            return response.promise;
        }
    };

 //


    Model.NodeHelper = {
        newItem: function (item) {
            if (!item.what) return true;
            var what = item.what.split(' ');
            if (what.indexOf());

            return true;
        }
    };


    Model.NodeHelper.Methods = {
        olds: [],

        share: function(email) {
            var that = this;
            var d = $q.defer();
            $http.post(that.constructor.url('share')+'/'+that.sid, {email:email}).then(
                function(resp){
                    var rep = resp.data;
                    rep.status = parseInt(rep.status);
                    var code = parseInt(rep.content);
                    if (rep.status != 0) {
                        console.log(rep);
                        that.share_error(code, d, email);
                        return;
                    }

                    if (code == 1) {
                        /*ok. we ask the email user if he wants to share
                         the test to
                         */
                        var content = {type:'info', link:that.constructor.Name+'/'+that.sid,
                                       msg:'shared '+(that.name || that.code)+' ('+that.constructor.Name+') with you'};
                        Notification.notify(Helper.email2jid(email), content);
                        d.resolve(code);
                    }else that.share_error(code, d, email);
                });

            return d.promise;
        },

        node: function () {
            return this.constructor.Name+'-'+this.sid;
        },

        publish: function (item) {
            return Pubsub.publish(this.node(), item);
        },

        unsubscribe: function() {
            return Pubsub.unsubscribe(this.node());
        },

        getOldComments: function () {
            var self = this;
            var d = $q.defer();

            if (self.loadedComments){
                d.resolve();
                return d.promise;
            }

            Pubsub.getItems(self.node()).then(
                function(items) {
                    $(items).find('body').each(
                        function(){
                            var item = JSON.parse($(this).text());
                            self.olds.push(item);
                        }
                    );
                    self.loadedComments = true;
                    d.resolve();
                },
                function(e){
                   console.log(e);
                    d.reject(e);
                }
            );
            return d.promise;
        }

    };

    Notification.conn.addHandler(Model.new_item, null, "message", null, null, Pubsub.service);


    Model.include(AbstractModel_i);
    Model.include(Local_save);
    Model.include(Passive_save);
    Model.extend(AbstractModel_e);
    Model.extend(Server_fetch);
    Model.include(Server_save);
    Model.include(Server_destroy);

    window.model = Model;
    return Model;
}]);

