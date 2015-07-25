/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SaveItemCtrl', [function (){
    var self = this;

    self.setType = function (type) {
        self.dialog = angular.element('#save-'+type+'-modal');
    };

    self.setItem = function (item) {
        self.item = angular.copy(item);
        self.working = false;
        self.error = null;
    };

    self.openDialog = function() {
        self.dialog.modal();
    };

    self.save = function () {
        console.log('save');
        self.working = true;
        console.log(self.item);

        self.item.save().then(
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
