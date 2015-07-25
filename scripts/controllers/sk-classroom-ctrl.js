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
