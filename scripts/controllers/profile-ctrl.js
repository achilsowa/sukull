/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('ProfileCtrl', ['AuthLoaderService', 'TranslateService', function (AuthLoader, Translate){
    var self = this;

    self.init = function (user) {
        self.dialog = angular.element('#profile-modal');
        self.user = user;
        self.working = false;
        self.error = null;

    };

    self.openDialog = function() {
        self.dialog.modal();
    };

    self.editPwd = function (old, new1, new2) {

        self.working = true;
        if (new1 != new2) {
            self.working = false;
            self.error = Translate.tr('The new passwords do not match');
            return;
        }

        AuthLoader.editpwd(old, new1, new2).then(
            function(){
                self.working = false;
                self.error = null;
            },function (e) {
                self.working = false;
                self.error = Translate.tr(e.msg);
            }
        );
    };

    self.editTof = function (file, type) {

        AuthLoader.edittof(file, type).then(
            function (rep) {
                self.working = false;
                console.log('editTof');
                self.error = null;
            }, function (error){
                self.working = false;
                console.log('editTof2');
                console.log(error);
                self.error = error.msg;
            });
    }
}]);
