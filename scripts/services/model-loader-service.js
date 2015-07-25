/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('ModelLoaderService', ['$q', 'ClassroomModel', 'TestModel', 'StudentsClassroomModelFactory', 'MarksTestModelFactory', 'AuthLoaderService', 'NotificationService', function ($q, ClassroomModel, TestModel, StudentsClassroomModelFactory, MarksTestModelFactory, AuthLoader, Notification){

    var ModelLoader = {};

    ModelLoader.loadClassrooms = function (forceReload) {
        return AuthLoader.load().then(function(){
            return ClassroomModel.fetch(forceReload);
        });
    };

    ModelLoader.loadTests = function (forceReload) {
        return AuthLoader.load().then(function(){
                return TestModel.fetch(forceReload);
	        }
	    );
    };

    ModelLoader.loadClassroom = function (sid, forceReload) {
        return AuthLoader.load().then(function(){
            return ClassroomModel.fetch_one(sid).then(
                function () {
                    var Students = StudentsClassroomModelFactory.create(sid);
                    return Students.fetch();
                });
        });
    };

    ModelLoader.loadTest = function (sid, forceReload) {
        return AuthLoader.load().then(function(){
            return TestModel.fetch_one(sid).then(
	            function () {
                    console.log(sid, TestModel.records);
                    var test = TestModel.find_by_sid(sid);
                    return ModelLoader.loadClassroom(test.classroom.sid).then(
                        function () {
                            var Marks = MarksTestModelFactory.create(sid);
                            return Marks.fetch();
                        }
                    );
		    });
        });
    };
	
    ModelLoader.load = function () {
        console.log({f:ClassroomModel.isFetched});
        var response = $q.defer();

	
        return ClassroomModel.fetch().then(
            function () {
                var left = ClassroomModel.count();
                ClassroomModel.each(function(classroom){
                    console.log(classroom.id);
                    var Students = StudentsClassroomModelFactory.create(classroom.sid);
                    Students.fetch().then(function (){
                        if (--left == 0) response.resolve();
                    }, function (){
                        console.log('error', left);
                        response.reject();
                    });
                });
                return response.promise;
            }
        ).then(
            function (){
                TestModel.fetch().then(function () {
                    console.log(TestModel.count());
                    TestModel.each(function(test){
                        console.log(test.sid);
                        var Marks = MarksTestModelFactory.create(test.sid);
                        Marks.fetch();
                    });
                });
            },
            function (error) {
                console.log('alerts', error);
                if (error.id == 5) {
                    //this request is active at this time
                }
                if (error.status == 400) {
                    //login pb
                }

                response.reject(error);
                return response.promise;
            });
    };

    ModelLoader.shareHandler = function(item) {
        console.log(item);
        var content = $(item).find('body');
        if (!content) return true;
        content = JSON.parse(content);
        var sid = content.sid;
        var what = content.what;
        if (!item || !what) return true;
        if (what == 'tests') ModelLoader.loadTest(sid);
        else if (what == 'classrooms') ModelLoader.loadClassroom(sid);
        return true;
    };

    //Notification.conn.addHandler(ModelLoader.shareHandler, 'urn:xmpp:share', "message", "chat");
    return ModelLoader;

}]);
