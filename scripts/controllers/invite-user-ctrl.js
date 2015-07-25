/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('InviteUserCtrl', ['AuthLoaderService', function (AuthLoader){
    var self = this;

    self.init = function (classrooms) {
        self.dialog = angular.element('#invite-user-modal');
        self.working = false;
        self.error = null;
	    self.classrooms = classrooms;
    };


    self.openDialog = function() {
        self.working = false;
        self.error = null;
        for(var i=0; i<self.classrooms.length; ++i) self.classrooms[i].selected = false;
        self.dialog.modal();
    };

    self.invite = function (email){
        console.log('invite');

	    self.working = true;
        var tos = [];
        for(var i=0; i<self.classrooms.length; ++i)
            if (self.classrooms[i].selected) tos.push(self.classrooms[i]);
        self.error = '';
        var max = tos.length;
        AuthLoader.invite(email).then(function (){
            if (!tos.length) {
                self.working = false;
                return;
            }
            for (var i=0; i<tos.length; ++i) {
                tos[i].share(email).then(function (){
                    if (--max != 0) return;
                    self.working = false;
                    self.dialog.modal('hide');
                }, function (e) {
                    console.log(e);
                    if (--max != 0) return;
                    self.error += e.msg;
                    self.working = false;
                });
            }
        }, function (e){
            console.log(e);
            self.error += e.msg;
            self.working = false;
        });


	    /*self.elt.share(email).then(
	    function(){
                self.working = false;
                self.dialog.modal('hide');
            },
            function (error){
                console.log(error);
                self.error = error.msg;
                self.working = false;
            }
        );
        */
    };
}]);
