/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('ImportStudentsCtrl', [function (){
    var self = this;
    self.dialog = angular.element('#import-students-modal');
    self.paths = [];

    self.setClassroomCtrl = function(clCtrl){
        self.working = false;
        self.loading = false;
        self.error = null;
        self.classroomCtrl = clCtrl;
    };

    self.init = function () {
        self.paths = [];
        self.working = false;
        self.loading = false;
        self.error = null;
        self.dialog.modal();
    };

    self.import_students = function () {
        self.working = true;

        self.classroomCtrl.import_students_from_file(self.paths).then(
            function (){
                self.working = false;
                self.dialog.modal('hide');
            },
            function (error){
                self.error = error.msg;
                self.working = false;
            }
        );
    }
}]);
