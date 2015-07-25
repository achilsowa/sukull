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
