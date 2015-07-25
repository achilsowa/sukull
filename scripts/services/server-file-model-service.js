/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('ServerFileModel', ['Model', 'Helper', '$rootScope', '$q', '$http', function(Model, Helper, $rootScope, $q, $http){

    var Server_File = Model.sub();
    Server_File.configure('Server_File', 'file', 'src', 'alt', 'type', 'sid');

    Server_File.extend({
        url : function (what) {
            if (what == 'save') return '../server/add-server-file';
        }
    });

    Server_File.status = { loading: false, points: ''};

    Server_File.include({
        validate: function () {
            if (!this.type) return 'type is mandatory';
        },

        save: function () { /*server save*/
            var url = this.constructor.url('save')+'/'+this.type;
            var response = $q.defer();
            $rootScope.$apply(function() {
                Server_File.status.loading = true;
            });


            $.upload(url, this.file,
                {
                    upload: {
                        progress:function(){
                            $rootScope.$apply(function() {
                                Server_File.status.points += '.';
                                console.log('p', Server_File.status.loading);
                            });
                        }
                    },
                    success:function (rep){
                        $rootScope.$apply(function() {
                            Server_File.status.loading = false;
                            Server_File.status.points = '';
                        });
                        response.resolve(rep);
                    },
                    error: function (error){
                        $rootScope.$apply(function() {
                            Server_File.status.points = '';
                            Server_File.status.loading = false;
                        });
                        response.reject(error);
                    }
                }
            );
            return response.promise;
        }
    });
    Server_File.Helper = {
        addFile: function (file) {
            var d = $q.defer();
            var that = this;
            var file=new Server_File({file: file,type:0});
            file.psave();/*so that the file can have an id*/
            file.save().then(
                function (path) {
                    self.working = false;
                    if (path == '0') {
                        d.reject({msg:'Error while saving the file. Check that the extension and the size are correct'});
                        return;
                    }
                    console.log(path);
                    $http.post(that.constructor.url('add-file')+'/'+that.sid, {file:path}).then(
                        function(rep){
                            rep = rep.data;
                            console.log(rep);
                            rep.status = parseInt(rep.status);
                            if (rep.status != 0) {
                                d.reject({msg: 'Error while adding the file'});
                                return;
                            }
                            d.resolve();
                            that.files.push(path);
                            console.log(that);
                        },
                        function(){d.reject({msg:'Error while adding the file'});}
                    );
                }, function (error){
                    d.reject({msg:'Error while adding the file'});
                });

            return d.promise;
        }
    };


    return Server_File;
}]);
