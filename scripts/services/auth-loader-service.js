/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('AuthLoaderService', ['$q', '$http', 'RegisterService', 'NotificationService', 'PubSubService', 'Helper', 'Strophe', 'ServerFileModel', function ($q, $http, Register, Notification, Pubsub, Helper, Strophe, ServerFile){

    var AuthLoader = {};
    AuthLoader.user = {is_loaded:false, me:true};
    AuthLoader.page = {title:null};

    AuthLoader.getUser = function(){
        var d = $q.defer();
        if (AuthLoader.user.is_connected) {
            console.log('ton');
            d.resolve(AuthLoader.user);
            return d.promise;
        }
        return $http.get('../server/get-user/0').then(
            function(resp){
                angular.copy(resp.data, AuthLoader.user);
                AuthLoader.user.me = true;
                AuthLoader.is_connected = true;
                console.log('not');
                console.log(AuthLoader.user);
                d.resolve(AuthLoader.user);
                return d.promise;
            }
        );
    };

    AuthLoader.load = function () {
        var self = this;
        var response = $q.defer();

        return AuthLoader.getUser().then(
            function (resp) {
                AuthLoader.user.first = parseInt(AuthLoader.user.first);
		        if (self.user.is_connected) {
                    response.resolve();
                    return response.promise;
                }

                Notification.init(Helper.email2jid(AuthLoader.user.email));
		        if (AuthLoader.user.first) {
		            return Register.register(AuthLoader.user).then(
			            function (){
                            AuthLoader.user.is_connected = true;
                            AuthLoader.user.first = 0;

                            return Pubsub.createNode('users-'+Strophe.getNodeFromJid(Helper.email2jid(AuthLoader.user.email))).then(
                                function () {
                                    Notification.getNotifications();
                                }
                            );
                        });
		        }else {
                    console.log(AuthLoader.user);
                    return Register.connect(AuthLoader.user).then(
			            function (){
                            Notification.getNotifications();
                            AuthLoader.user.is_connected = true;
                            response.resolve();
                            return response.promise;
			        });
		        }
            }
        );
    };

    AuthLoader.invite = function(email) {
        var d = $q.defer();
        $http.post('../server/invite-user', {email:email}).then(
            function(resp){
                console.log(resp.data);
                resp = parseInt(resp.data);
                console.log(resp);
                if (resp == 1) {
                    d.resolve();
                }else if (resp == 2){
                    d.reject({msg:email+' is already in Sukull. If you want to share your classroom with him, open the classroom and do it there'});
                }else if(resp == 3){
                    d.reject({msg: email+' is no more a member of Sukull'});
                }else {
                    d.reject({msg:'Unable to invite '+email+' to join Sukull'});
                }
            },
            function (e) {
                console.log(e);
                d.reject(e);
            }
        );
        return d.promise;
    };

    AuthLoader.editpwd = function (old, new1, new2) {
        var d = $q.defer();

        $http.post('../server/change-pwd', {old:old, new1:new1, new2: new2}).then(
            function (rep) {
                rep = parseInt(rep.data);
                if (rep != 1) {
                    d.reject({msg: 'Unable to change the password'})
                    return;
                }
                d.resolve();
                return;
            },
            function (e) {
                d.reject({msg: 'Unable to change the password'});
            }
        );
        return d.promise;
    };

    AuthLoader.edittof = function (file, type) {
        var d = $q.defer();

        var file=new ServerFile({file: file,type:type});
        file.psave();/*so that the file can have an id*/
        file.save().then(
            function (path) {
                self.working = false;
                if (path == '0') {
                    d.reject({msg:'Error while saving the file. Check that the extension and the size are correct'});
                    return;
                }
                console.log(path);
                $http.post('../server/change-tof', {img:path}).then(
                    function(rep){
                        rep = parseInt(rep.data);
                        if (rep != 1) {
                            d.reject({msg: 'Error while changing the image1'});
                            return;
                        }
                        d.resolve();
                        AuthLoader.user.img = 'imgs/'+path;
                    },
                    function(){d.reject({msg:'Error while changing the image2'});}
                );
            }, function (error){
                d.reject({msg:'Error while changing the image3'});
            });

        return d.promise;
    };

    AuthLoader.disconnect = Register.disconnect;
    window.auth = AuthLoader;
    return AuthLoader;
}]);
