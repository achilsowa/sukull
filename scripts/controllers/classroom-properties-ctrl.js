/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('ClassroomPropertiesCtrl', ['ClassroomModel', 'StudentsClassroomModelFactory', function (ClassroomModel, StudentsClassroom){
    var self = this;

    self.setClassroom = function (classroom) {
        self.dialog = angular.element('#classroom-properties-modal');
        self.working = false;
        self.error = null;
        self.loading = true;
	    self.classroom = classroom;
        self.files = classroom.files;
        self.olds = classroom.olds;
        self.comments = classroom.comments;

        classroom.getOldComments().then(
            function(){ self.loading = false;},
            function(){ self.error = "error while getting messages"; console.log('bad');}
        );


        console.log('ps');


        var Students = StudentsClassroom.elts[self.classroom.sid];
        if (!Students) return;
        var std_nbr = Students.count();
        var male_nbr = 0, female_nbr = 0;
        Students.each(function (std) {
            if (std.sexe == '1') ++male_nbr;
            if (std.sexe == '2') ++female_nbr;
        });
        if (std_nbr) {
            male_per = Number(100*male_nbr/std_nbr).toFixed(1);
            female_per = Number(100*female_nbr/std_nbr).toFixed(1);
        }else {
            male_per = female_per = 0;
        }
        self.properties = {
            responsible:self.classroom.responsible,
            title:self.classroom.name+', '+self.classroom.school,
            std:std_nbr, male:male_nbr, male_per:male_per,
            female:female_nbr, female_per: female_per
        }

    };


    self.openDialog = function() {
        self.dialog.modal();
    };

    self.publish = function (comment){
	    self.working = true;
        var item = {msg: comment};
	    self.classroom.publish(item).then(
	        function(){
                self.working = false;
                self.error = null;
            },
            function (error){
                console.log(error);
                self.error = error.msg;
                self.working = false;
            }
        );
    };

    self.addFile = function (file) {
        console.log(self.classroom);
        self.classroom.addFile(file).then(
            function (rep) {
                self.working = false;
                console.log('add file');
                self.error = null;
                console.log(file);
                self.publish('attached a file ('+file.name+')');
            }, function (error){
                self.working = false;
                console.log('editTof2');
                console.log(error);
                self.error = error.msg;
            });
    };
}]);
