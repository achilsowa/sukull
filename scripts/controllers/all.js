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
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('MainCtrl', ['AuthLoaderService', 'ClassroomModel', 'TestModel', 'ServerFileModel', '$controller', function (AuthLoader, Classrooms, Tests, ServerFile, $controller) {
    var self = this;
    self.classrooms = Classrooms.records;
    self.strs = {
        'Classrooms' : 'Classrooms',
        'Tests' : 'Tests',
        'Colleagues' : 'Colleagues',
        'Invite a colleague on sukull' : 'Invite a colleague on sukull',
        'All tests' : 'All tests',
        'All classrooms' : 'All classrooms',

        'Profile': 'Profile',
        'Settings': 'Settings',
        'Logout': 'Logout',

        'Uploading file': 'Uploading file',

        'Error' : 'Error',
        'Unable to reach the server' : 'Unable to reach the server',
        'All the changes made now may not be saved on the server': 'All the changes made now may not be saved on the server'
    };


    self.tests = Tests.records;
    self.user = AuthLoader.user;
    self.page = AuthLoader.page;
    self.loading = false;

    self.disconnect = function (){
	    console.log('disconnect');
	    AuthLoader.disconnect;
	    $.ajax({
	        type:'get',
	        url: '../server/logout',
	        async:false
	    });
    };

    var initNotificationCtrl = function () {
        self.notificationCtrl = $controller('NotificationCtrl');
        self.new_notification = self.notificationCtrl.new_notification;
        self.showNotifications = function () {
            self.notificationCtrl.openDialog();
        }

        self.notificationCtrl.init();
    };

    var initInviteUserCtrl = function () {
        self.inviteUserCtrl = $controller('InviteUserCtrl');

        self.invite = function () {
            self.inviteUserCtrl.openDialog();
        }

        self.inviteUserCtrl.init(Classrooms.records);
    };

    var initProfileCtrl = function () {
        self.profileCtrl = $controller('ProfileCtrl');

        self.profile = function () {
            self.profileCtrl.openDialog();
        }

        self.profileCtrl.init(AuthLoader.user);
    };

    var initServerFileCtrl = function () {

        self.serverFileCtrl = ServerFile.status;
        console.log(self.serverFileCtrl);
    };

    initNotificationCtrl();
    initInviteUserCtrl();
    initProfileCtrl();
    initServerFileCtrl();
}]);

/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('NotificationCtrl', ['NotificationService', function (Notification){
    var self = this;

    self.init = function () {
        self.dialog = angular.element('#notification-modal');
        self.new_notification = false;
        self.notifications = Notification.items;
        self.olds = Notification.olds;

    };


    self.openDialog = function() {
        //if (self.new_notification) Notification.readNotifications();
        self.new_notification = false;
        self.dialog.modal();
    };

}]);
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
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SKClassroomCtrl', ['ClassroomModel', 'StudentsClassroomModelFactory', 'TestModel', 'ModelLoaderService', '$controller', '$routeParams', '$location', '$q', function(ClassroomModel, StudentsClassroomModelFactory, TestModel, ModelLoader, $controller, $routeParams, $location, $q) {
    var self = this;


    self.switchViewCtrl = $controller('SwitchViewCtrl');
    self.switchViewCtrl.init(2);

    self.headers = [{name:'name'}, {name:'email'}, {name:'sexe', index:'sexe_code'}];
    self.view_icon = 'fa fa-user';

    self.classroom = ClassroomModel.find_by_sid($routeParams.id);
    if (!self.classroom){
        console.log($routeParams.id + ' does not exist');
        $location.path('/');
        return;
    }
    var Students = StudentsClassroomModelFactory.create($routeParams.id);
    self.students = Students.records;


    var initSaveStudentCtrl = function () {
        self.saveStudentCtrl = $controller('SaveItemCtrl');
        self.saveStudentCtrl.setType('student');

        self.new_student = function () {
            self.saveStudentCtrl.setItem(new Students({}));
            self.saveStudentCtrl.openDialog();
        };

        self.edit_student = function (student) {
            self.saveStudentCtrl.setItem(student);
            self.saveStudentCtrl.openDialog();
        };

        self.remove_student = function (student) {
            console.log(student);
        };
    };


    var initShareCtrl = function (){
	self.shareCtrl = $controller('ShareEltCtrl');
	self.shareCtrl.setElt(self.classroom);

	self.share = function (){
	    self.shareCtrl.openDialog();
	};
    };


    var initSaveTestCtrl = function () {
        self.saveTestCtrl = $controller('SaveItemCtrl');
        self.saveTestCtrl.setType('test');

        self.new_test = function () {
            self.saveTestCtrl.setItem(new TestModel({classroom:self.classroom}));
            self.saveTestCtrl.openDialog();
        };

        self.edit_test = function (test) {
            self.saveTestCtrl.setItem(test);
            self.saveTestCtrl.openDialog();
        };

        self.remove_test = function (student) {
            console.log(student);
        };
    };

    var initImportStudentsCtrl = function () {
        self.importStudentsCtrl = $controller('ImportStudentsCtrl');
        self.importStudentsCtrl.setClassroomCtrl(self);

        self.import_students = function () {
	    console.log('import students');
            self.importStudentsCtrl.init();
        };

        self.import_students_from_file = function (files_src) {
            var response = $q.defer(); var left = files_src.length;
            if (left == 0) response.resolve();
            for (var i=0; i<files_src.length; ++i) {
                Students.import_students_from_file(files_src[i]).then(
                    function (){
                        if (--left == 0) response.resolve();
                    }, function (e) {
                        if (--left == 0) response.reject(e);
                    }
                )
            }
            return response.promise;
        }
    };

    var initPropertiesCtrl = function (){
        self.propCtrl = $controller('ClassroomPropertiesCtrl');
        self.propCtrl.setClassroom(self.classroom);

        self.more = function (){
            self.propCtrl.setClassroom(self.classroom);
            self.propCtrl.openDialog();
        }
    }

    initSaveStudentCtrl();
    initSaveTestCtrl();
    initImportStudentsCtrl();
    initShareCtrl();
    initPropertiesCtrl();
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SKClassroomsCtrl', ['ClassroomModel', 'ModelLoaderService', 'TranslateService', '$controller', '$location', function(ClassroomModel, ModelLoader, Translate, $controller, $location) {
    var self = this;

    self.strs = {
        'New Classroom' : 'New Classroom'
    };
    
    self.switchViewCtrl = $controller('SwitchViewCtrl');
    self.switchViewCtrl.init(2);
    self.switchViewCtrl.go(1);

    self.headers = [{name:'name', model:ClassroomModel}, {name:'school', model:ClassroomModel}, {name:'responsible', model:ClassroomModel}];
    self.view_icon = 'fa fa-university';

    self.classrooms = ClassroomModel.records;
    self.ClassroomModel = ClassroomModel;
    self.saveCtrl = $controller('SaveItemCtrl');
    self.saveCtrl.setType('classroom');

    self.add = function() {
        self.saveCtrl.setItem(new ClassroomModel({}));
        self.saveCtrl.openDialog();
    };

    self.edit = function(classroom) {
        self.saveCtrl.setItem(classroom);
        self.saveCtrl.openDialog();
    };

    self.remove = function (classroom) {
        classroom.sdestroy().then(function(){}, function (e){console.log(e);alert(Translate.tr(e.msg))});
    };

    self.open = function (classroom) {
        $location.path('/classrooms/'+classroom.sid);
    }
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SKTestCtrl', ['TestModel', 'MarksTestModelFactory', 'ClassroomModel', 'StudentsClassroomModelFactory', 'ModelLoaderService', 'TranslateService', '$routeParams', '$controller',  function( TestModel, MarksTestModelFactory, ClassroomModel, StudentsClassroomModelFactory, ModelLoader, Translate, $routeParams, $controller) {
    var self = this;
    self.id = $routeParams.id;

    self.MarksModel = MarksTestModelFactory.create(self.id);
    var test = TestModel.find_by_sid(self.id);

    if (!test){
        console.log($routeParams.id + ' does not exist');
        $location.path('/');
        return;
    }
    self.test = test;
    var classroom = test.classroom;
    classroom = ClassroomModel.find_by_sid(classroom.sid);
    self.StudentsModel = StudentsClassroomModelFactory.create(classroom.sid);


    self.StudentsModel.each(function (std) {
        var mark = self.MarksModel.stdids[std.sid];
        if (!mark)
            mark = new self.MarksModel({student_id: std.sid, value: 0, name: std.name});

        mark.psave();
        console.log(mark);
    });


    self.headers = [
        {name:Translate.tr('name'), index: 'name', model:self.StudentsModel},
        {name:Translate.tr('sexe'), index:'sexe_code', model:self.StudentsModel},
        {name:self.test.code, index:'value', model:self.MarksModel},
        {name:Translate.tr('appreciation'), formula: 'mgp(c1)'},
        {name:Translate.tr('result'), formula: 'success_fail(c1)'},
        {name:Translate.tr('sexe-result'), formula:'sexe_mark(b1, c1)'}
    ];



    var initShareCtrl = function (){
    	self.shareCtrl = $controller('ShareEltCtrl');
	    self.shareCtrl.setElt(self.test);

	    self.share = function (){
	        self.shareCtrl.openDialog();
	    };
    };

    var initPropertiesCtrl = function (){
        self.propCtrl = $controller('TestPropertiesCtrl');
        self.propCtrl.setTest(self.test);

        self.more = function (){
            console.log(self.test);
            self.propCtrl.setTest(self.test);
            self.propCtrl.openDialog();
        }
    };

    initShareCtrl();
    initPropertiesCtrl();
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SKTestsCtrl', ['TestModel', 'ModelLoaderService', 'TranslateService', '$controller', '$location', function(TestModel, ModelLoader, Translate, $controller, $location) {
    var self = this;


    self.switchViewCtrl = $controller('SwitchViewCtrl');
    self.switchViewCtrl.init(2);

    self.headers = [{name:'code'}, {name:'classroom', index:'classroom_name'}, {name:'subject'}, {name:'responsible'}, {name:'date'}];
    self.view_icon = 'fa fa-edit';


    self.tests = TestModel.records;

    self.saveCtrl = $controller('SaveItemCtrl');
    self.saveCtrl.setType('test');

    self.add = function() {
        //self.saveCtrl.setItem(new ClassroomModel({}));
        self.saveCtrl.openDialog();
    };

    self.edit = function(test) {
        self.saveCtrl.setItem(test);
        self.saveCtrl.openDialog();
    };

    self.remove = function (test) {
        test.sdestroy().then(function(){}, function (e){alert(Translate.tr(e.msg))});
    };

    self.open = function (test) {
        $location.path('/tests/'+test.sid);
    }
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SwitchViewCtrl', [function (){
    var self = this;
    self.init = function (max){
        self.current_tab = 0;
        self.max_tab = max;
    };

    self.next = function() {
        self.current_tab = (++self.current_tab) % self.max_tab;
    };

    self.go = function (tab){
        self.current_tab = tab % self.max_tab;
    }
}]);

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
