/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('TestPropertiesCtrl', ['ClassroomModel', 'StudentsClassroomModelFactory', 'MarksTestModelFactory', function (ClassroomModel, StudentsClassroom, MarksTest){
    var self = this;

    self.setTest = function (test) {
        self.dialog = angular.element('#test-properties-modal');
        self.working = false;
        self.error = null;
        self.loading = true;
	    self.test = test;
        self.files = test.files;
        self.olds = test.olds;
        self.comments = test.comments;

        test.getOldComments().then(
            function(){ self.loading = false;},
            function(){ self.error = "error while getting messages"; console.log('bad');}
        );

        var Marks = MarksTest.elts[self.test.sid];
        if (!Marks) return;
        var Students = StudentsClassroom.elts[self.test.classroom.sid];
        if (!Students) return;
        var std_nbr = Students.count();
        var male_nbr = 0, female_nbr = 0;
        Students.each(function (std) {
            if (std.sexe == '1') ++male_nbr;
            if (std.sexe == '2') ++female_nbr;
        });
        var success_nbr=0, fail_nbr=0, male_success_nbr=0, mean=0;
        var female_success_nbr=0, male_fail_nbr=0, mal_success_fail_nbr=0;
        var female_fail_nbr = 0, male_mean = 0, female_mean = 0;
        Marks.each(function (mark) {
            var std = Students.find_by_sid(mark.student_id);
            if (std == null) return;
            mark.value = parseFloat(mark.value);
            if (mark.value >= 10) {
                ++success_nbr;
                if (std.sexe == '1') ++male_success_nbr;
                if (std.sexe == '2') ++female_success_nbr;
            }else {
                ++fail_nbr;
                if (std.sexe == '1') ++male_fail_nbr;
                if (std.sexe == '2') ++female_fail_nbr;
            }
            if (std.sexe == '1') male_mean += mark.value;
            if (std.sexe == '2') female_mean += mark.value;
            mean += mark.value;
        });
        if (std_nbr > 0) {
            mean /= std_nbr;
            mean = Number(mean).toFixed(2);
        }else mean = 0;
        if (male_nbr > 0) {
            male_mean /= male_nbr;
            male_mean = Number(male_mean).toFixed(2);
        }else male_mean = 0;
        if (female_nbr > 0) {
            female_mean /= female_nbr;
            female_mean = Number(female_mean).toFixed(2);
        }else female_mean = 0;
        var success_per = 0, fail_per = 0, male_per = 0, female_per = 0;
        var male_success_per = 0, female_success_per = 0;
        var male_fail_per = 0, female_fail_per = 0;
        if (std_nbr) {
            male_per = Number(100*male_nbr/std_nbr).toFixed(1);
            female_per = Number(100*female_nbr/std_nbr).toFixed(1);
            success_per = Number(100*success_nbr/std_nbr).toFixed(1);
            fail_per = Number(100*fail_nbr/std_nbr).toFixed(1);
        }
        if (male_nbr) {
            male_success_per = Number(100*male_success_nbr/male_nbr)
                .toFixed(1);
            male_fail_per = Number(100*male_fail_nbr/male_nbr).toFixed(1);
        }
        if (female_nbr) {
            female_success_per=Number(100*female_success_nbr/female_nbr)
                .toFixed(1);
            female_fail_per = Number(100*female_fail_nbr/female_nbr)
                .toFixed(1);
        }

        self.properties = {
            responsible:self.test.responsible, title:self.test.code+', '+self.test.classroom.name,
            std:std_nbr, male:male_nbr, male_per:male_per,
            female:female_nbr, female_per: female_per, mean:mean,
            success_per:success_per, fail_per:fail_per,
            male_success:male_success_nbr, male_fail:male_fail_nbr,
            female_success:female_success_nbr, success:success_nbr,
            female_fail:female_fail_nbr, fail:fail_nbr,
            male_mean:male_mean, female_mean:female_mean,
            male_success_per:male_success_per,
            male_fail_per:male_fail_per,
            female_success_per:female_success_per,
            female_fail_per:female_fail_per
        }

    };


    self.openDialog = function() {
        self.dialog.modal();
    };

    self.publish = function (comment){
        self.working = true;
        var item = {msg: comment};
        self.test.publish(item).then(
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
        console.log(self.test);
        self.test.addFile(file).then(
            function (rep) {
                self.working = false;
                console.log('add file');
                self.error = null;
                console.log(file);
                self.publish('attached a file ('+file.name+')');
            }, function (error){
                self.working = false;
                console.log(error);
                self.error = error.msg;
            });
    };
}]);
