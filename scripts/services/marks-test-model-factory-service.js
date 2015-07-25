/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('MarksTestModelFactory', ['Model', 'ClassroomModel', 'TestModel', 'Helper', '$q', function(Model, ClassroomModel, TestModel, Helper, $q){
    var MarksTestModelFactory = {};
    MarksTestModelFactory.elts = [];
    MarksTestModelFactory.create = function(tid) {
        if (this.elts[tid]) return this.elts[tid];
        var Marks = Model.sub();
        Marks.configure('Mark-'+tid,
            'value', 'student_id',
            'sid');

        Marks.parent_id = tid;
        this.elts[tid] = Marks;
        Marks.test = TestModel.find_by_sid(tid);
        Marks.classroom = ClassroomModel.find_by_sid(Marks.test.classroom.sid);

        Marks.extend({
            url: function (what) {
                if (what == 'destroy') return '../server/del-mark';
                if (this.test.sid) {
                    if (what == 'save') return '../server/add-mark/'+this.test.sid;
                    if (what == 'fetch') return '../server/get-marks/'+this.test.sid;
                }else {
                    var test = TestModel.find(this.test.id);
                    if (test.sid) {
                        this.test = test;
                        this.url(what);
                    }else {
                        return false;
                    }
                }
            },

            sids : [],

            stdids : [],

            is_ssa : function (attr) { //ssa == server side attribute
                return (attr == 'value' || attr == 'student_id');
            },
            Name : 'marks-'+tid
        });

        Marks.include({
            validate: function() {
                if (!this.student_id)
                    return 'the corresponding student is required';
                if (this.id && this.constructor.test.cannot_be_edited)
                    return 'No rights to edit this on the server. Contact the '+
                    'responsible of the test for any modification';

                if (this.value); /*must checked that is a real or a letter*/
                this.constructor.stdids[this.student_id] = this;
            }

        });

        Model.all[Marks.Name] = Marks;
        return Marks;
    };

    return MarksTestModelFactory;
}]);
