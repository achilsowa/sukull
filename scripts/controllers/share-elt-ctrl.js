/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('ShareEltCtrl', [function (){
    var self = this;

    self.setElt = function (elt) {
        self.dialog = angular.element('#share-elt-modal');
        self.working = false;
        self.error = null;
	self.elt = elt;
    };


    self.openDialog = function() {
        self.dialog.modal();
    };

    self.share = function (email){
	self.working = true;
	self.elt.share(email).then(
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
    };
}]);
