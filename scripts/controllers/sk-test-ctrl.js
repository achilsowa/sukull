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
