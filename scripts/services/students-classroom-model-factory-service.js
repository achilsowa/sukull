/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('StudentsClassroomModelFactory', ['Model', 'ClassroomModel', 'Helper', '$http', '$q', function(Model, ClassroomModel, Helper, $http, $q){
    var StudentsClassroomModelFactory = {};
    StudentsClassroomModelFactory.elts = [];
    StudentsClassroomModelFactory.create = function(clid) {
        if (this.elts[clid]) return this.elts[clid];
        var Students = Model.sub();
        Students.configure('Student-'+clid,
            'name', 'email', 'phone', 'sexe', 'sid',
            'sexe_code', 'images_str', 'img');
        Students.parent_id = clid;
        Students.classroom_id = clid;
        this.elts[clid] = Students;
        Students.classroom = ClassroomModel.find_by_sid(clid);
	    console.log(Students.classroom, clid);
        Students.extend({
            url: function (what) {
                if (what == 'destroy') return '../server/del-student';
                if (this.classroom.sid) {
                    if (what == 'save') return '../server/add-student/'+this.classroom.sid;
                    if (what == 'fetch') return '../server/get-students/'+this.classroom.sid;
                    if (what == 'add-std-from-file') return '../server/create-std-from-file/'+this.classroom.sid;
                }else {
                    var classroom = ClassroomModel.find_by_sid(this.classroom.id);
                    if (classroom.sid) {
                        this.classroom = classroom;
                        this.url(what);
                    }else {
                        return false;
                    }
                }
            },

            import_students_from_file: function (file_src){
                var response = $q.defer();
                var that = this;
                $http.get(this.url('add-std-from-file')+'/'+file_src).then(
                    function (resp) {
                        var rep = resp.data;
                        rep.status = parseInt(rep.status);
                        if (rep.status != 0) {
                            console.log(rep.content);
                            response.reject({msg:'unable to add the students. Check you have the right permissions'})
                            return;
                        }

                        var items = rep.content;
                        for (var i = 0, max = items.length; i < max; ++i) {
                            var item = new that(items[i]);
                            item.psave();
                        }
                        response.resolve();
                    });
                return response.promise;
            },

            sids : [],

            is_ssa : function (attr) { //ssa == server side attribute
                return (attr == 'name' || attr == 'email' || /*attr == 'phone' ||*/
                attr == 'sexe' || attr == 'images_str');
            },

            is_isa : function (attr) { //isa == insertable attribute
                return (attr == 'name' || attr == 'email' || attr == 'phone' ||
                attr == 'sexe_code');
            },

            Name : 'students-'+clid,
            col_index: []
        });

        Students.include({
            validate: function() {
                if (!this.name) return 'name is required to save the student';
                if (this.id && this.constructor.classroom.cannot_be_edited)
                    return 'No rights to edit this on the server. Contact the '+
                    'owner of the classroom for any modification';

                this.name = Helper.present(this.name);
                this.email = Helper.present(this.email);
                if (this.sexe == '1') this.sexe_code = 'Male';
                else if (this.sexe == '2') this.sexe_code = 'Female';

                if (this.images_str)
                    this.img = this.images_str.split(';')[0];
                else this.img = 'imgs/avatar-default.png';

                this.constructor.sids[this.sid] = this;
            }
        });
        Model.all[Students.Name] = Students;
        return Students;
    };
    window.StudentsFactory = StudentsClassroomModelFactory;
    return StudentsClassroomModelFactory;
}]);
