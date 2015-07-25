/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('ClassroomModel', ['Model', 'ServerFileModel', 'Helper', 'RegisterService', 'PubSubService', function(Model, ServerFile, Helper, Register, Pubsub){
    var Classroom = Model.sub();
        Classroom.configure('Classroom', //name
            'name', 'school', 'responsible', 'files', //functional params
            'selected', 'cannot_be_edited', 'sid');

    Classroom.extend({
        url : function(what) {
            if (what == 'save') return '../server/add-classroom';
            if (what == 'fetch') return '../server/get-classrooms';
            if (what == 'destroy') return '../server/del-classroom';
            if (what == 'fetch_one') return '../server/get-classroom';
	        if (what == 'share') return '../server/share-classroom';
            if (what == 'activate') return '../server/activate-classroom';
            if (what == 'add-file') return '../server/add-file-classroom';
        },

        sids : [],

        is_ssa : function (attr) { //ssa == server side attribute
            return (attr == 'name' || attr == 'school' || attr == 'sid');
        },

        Name: 'classrooms',
	    mustHaveNode: true
    });

    Classroom.include(ServerFile.Helper);
    Classroom.include({
        share_error: function(code, d, email) {
	        if (code == -1) {
                d.reject({what:20, msg: 'Unable to find '+email});
		    }else if (code == -3){
                d.reject({what:21, msg: 'You already share this classroom with '+email});
            }else {
	      		d.reject({what:22, msg: 'Error while sharing the test', code:code});
       	    }
        },

        validate: function() {
            if (!this.name)
                return 'the name is required to save the classroom';

            this.name = Helper.present(this.name);
            if (this.school) this.school  = Helper.present(this.school);
            if (!this.responsible) this.responsible = Register.user.name;
            this.responsible = Helper.present(this.responsible);

            if (this.id){
                var sid = this.constructor.find(this.id).sid;
                if (this.constructor.sids[sid])
                    this.cannot_be_edited =
                        this.constructor.sids[sid].cannot_be_edited;

                if (this.cannot_be_edited)
                    return 'No rights to edit this on the server. Contact  '+
                    this.responsible+' for any modification ';
                if(sid) this.constructor.sids[sid] = this;
            }
            this.constructor.sids[this.sid] = this;
        }
    });
    Classroom.include(Model.NodeHelper.Methods);
    Model.all[Classroom.Name] = Classroom;

    Pubsub.conn.addHandler(Model.NodeHelper.newItem,  null, "message", null, null, Pubsub.service);

    return Classroom;
}]);
