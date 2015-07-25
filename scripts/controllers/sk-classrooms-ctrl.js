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
