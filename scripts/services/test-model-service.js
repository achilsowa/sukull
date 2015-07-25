/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('TestModel', ['Model', 'ServerFileModel', 'Helper', 'RegisterService', 'PubSubService', function(Model, ServerFile, Helper, Register, Pubsub){
    var Test = Model.sub();
    Test.configure('Test', //name
        'code', 'date', 'subject', 'classroom', 'responsible', 'files',
        'cannot_be_edited', 'selected', 'sid', 'classroom_name');

    Test.extend({
        url : function(what) {
            if (what == 'save') return '../server/add-test';
            if (what == 'fetch') return '../server/get-tests';
            if (what == 'destroy') return '../server/del-test';
            if (what == 'fetch_one') return '../server/get-test';
            if (what == 'share') return '../server/share-test';
            if (what == 'activate') return '../server/activate-test';
            if (what == 'add-file') return '../server/add-file-test';
        },

        sids : [],

        is_ssa : function (attr) { //ssa == server side attribute
            return (attr == 'code' || attr == 'subject' || attr == 'date' || attr == 'classroom');
        },

        Name : 'tests',
        mustHaveNode: true
    });

    Test.include(ServerFile.Helper);
    Test.include({
        share_error: function (code, d, email) {
            if (code == -1) {
                d.reject({what:20, msg: 'Unable to find '+email});
            }else if (code == -3){
                d.reject({what:21, msg: 'You already share this classroom with '+email});
            }else if (code == -2){
                d.reject({what:22, msg: 'You need to share the classroom ('+this.classroom.name+') before you can share this test ', code:code});
            }else {
                d.reject({what:23, msg: 'Error while sharing the test', code:code});
            }
        },

        validate: function() {
            if (!(this.code && this.classroom.sid))
                return 'code and classroom are required to save the test';
            if (this.id && this.cannot_be_edited)
                return 'No rights to edit this on the server. Contact the '+
                'owner of the classroom for any modification';

            this.code = Helper.present(this.code);
            this.subject = Helper.present(this.subject);
            this.classroom_name = Helper.present(this.classroom.name);

            if (!this.responsible) this.responsible = Register.user.name;
            this.responsible = Helper.present(this.responsible);

            if (this.id){
                var sid = this.constructor.find(this.id).sid;
                if (this.constructor.sids[sid])
                    this.cannot_be_edited =
                        this.constructor.sids[sid].cannot_be_edited;

                if (this.cannot_be_edited)
                    return 'No rights to edit this on the server contact  '+
                    this.responsible+' for any modification ';

                this.constructor.sids[sid] = this;
            } else
                this.constructor.sids[this.sid] = this;
        }
    });
    Test.include(Model.NodeHelper.Methods);
    Model.all[Test.Name] = Test;

    Pubsub.conn.addHandler(Model.NodeHelper.newItem,  null, "message", null, null, Pubsub.service);
    return Test;
}]);
