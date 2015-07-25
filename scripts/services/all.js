/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('AuthLoaderService', ['$q', '$http', 'RegisterService', 'NotificationService', 'PubSubService', 'Helper', 'Strophe', 'ServerFileModel', function ($q, $http, Register, Notification, Pubsub, Helper, Strophe, ServerFile){

    var AuthLoader = {};
    AuthLoader.user = {is_loaded:false, me:true};
    AuthLoader.page = {title:null};

    AuthLoader.getUser = function(){
        var d = $q.defer();
        if (AuthLoader.user.is_connected) {
            console.log('ton');
            d.resolve(AuthLoader.user);
            return d.promise;
        }
        return $http.get('../server/get-user/0').then(
            function(resp){
                angular.copy(resp.data, AuthLoader.user);
                AuthLoader.user.me = true;
                AuthLoader.is_connected = true;
                console.log('not');
                console.log(AuthLoader.user);
                d.resolve(AuthLoader.user);
                return d.promise;
            }
        );
    };

    AuthLoader.load = function () {
        var self = this;
        var response = $q.defer();

        return AuthLoader.getUser().then(
            function (resp) {
                AuthLoader.user.first = parseInt(AuthLoader.user.first);
		        if (self.user.is_connected) {
                    response.resolve();
                    return response.promise;
                }

                Notification.init(Helper.email2jid(AuthLoader.user.email));
		        if (AuthLoader.user.first) {
		            return Register.register(AuthLoader.user).then(
			            function (){
                            AuthLoader.user.is_connected = true;
                            AuthLoader.user.first = 0;

                            return Pubsub.createNode('users-'+Strophe.getNodeFromJid(Helper.email2jid(AuthLoader.user.email))).then(
                                function () {
                                    Notification.getNotifications();
                                }
                            );
                        });
		        }else {
                    console.log(AuthLoader.user);
                    return Register.connect(AuthLoader.user).then(
			            function (){
                            Notification.getNotifications();
                            AuthLoader.user.is_connected = true;
                            response.resolve();
                            return response.promise;
			        });
		        }
            }
        );
    };

    AuthLoader.invite = function(email) {
        var d = $q.defer();
        $http.post('../server/invite-user', {email:email}).then(
            function(resp){
                console.log(resp.data);
                resp = parseInt(resp.data);
                console.log(resp);
                if (resp == 1) {
                    d.resolve();
                }else if (resp == 2){
                    d.reject({msg:email+' is already in Sukull. If you want to share your classroom with him, open the classroom and do it there'});
                }else if(resp == 3){
                    d.reject({msg: email+' is no more a member of Sukull'});
                }else {
                    d.reject({msg:'Unable to invite '+email+' to join Sukull'});
                }
            },
            function (e) {
                console.log(e);
                d.reject(e);
            }
        );
        return d.promise;
    };

    AuthLoader.editpwd = function (old, new1, new2) {
        var d = $q.defer();

        $http.post('../server/change-pwd', {old:old, new1:new1, new2: new2}).then(
            function (rep) {
                rep = parseInt(rep.data);
                if (rep != 1) {
                    d.reject({msg: 'Unable to change the password'})
                    return;
                }
                d.resolve();
                return;
            },
            function (e) {
                d.reject({msg: 'Unable to change the password'});
            }
        );
        return d.promise;
    };

    AuthLoader.edittof = function (file, type) {
        var d = $q.defer();

        var file=new ServerFile({file: file,type:type});
        file.psave();/*so that the file can have an id*/
        file.save().then(
            function (path) {
                self.working = false;
                if (path == '0') {
                    d.reject({msg:'Error while saving the file. Check that the extension and the size are correct'});
                    return;
                }
                console.log(path);
                $http.post('../server/change-tof', {img:path}).then(
                    function(rep){
                        rep = parseInt(rep.data);
                        if (rep != 1) {
                            d.reject({msg: 'Error while changing the image1'});
                            return;
                        }
                        d.resolve();
                        AuthLoader.user.img = 'imgs/'+path;
                    },
                    function(){d.reject({msg:'Error while changing the image2'});}
                );
            }, function (error){
                d.reject({msg:'Error while changing the image3'});
            });

        return d.promise;
    };

    AuthLoader.disconnect = Register.disconnect;
    window.auth = AuthLoader;
    return AuthLoader;
}]);
/**
 * Created by tchapda gabi on 20/06/2015.
 */

sukuApp.factory('ChartDataService', ['Helper', function (Helper){

    var ChartData = Spine.Class.sub({
        init: function (obj) {
            this.meta = obj;
            this.options = {col_data_series:true};
        }
    });

    ChartData.include({
        random_color: function () {
            return Math.round(Math.random()*256);
        },

        for_column : function (what) {
            if (!what) what = 'column';
            var options = this.options || {col_data_series:true};
            var data = {labels:[]};
            var item;
            var color =  "rgba("+this.random_color()+","+
                this.random_color()+","+this.random_color()+",";
            data.datasets = [];
            console.log(this.meta);
            M = this.meta;

            if (options.col_data_series) {
                if(this.meta.min_col < this.meta.max_col) {
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if(!this.meta.empty_rows[i])
                            data.labels.push(this.meta.row_headers[i]);
                    for (var j=this.meta.min_col+1; j<= this.meta.max_col; ++j){
                        if (this.meta.empty_cols[j]) continue;
                        color = "rgba("+this.random_color()+","+
                        this.random_color()+","+this.random_color()+",";
                        item = {
                            label: this.meta.col_headers[j],
                            fillColor: color+"0.7)",
                            strokeColor: color+"0.4)",
                            pointColor: color+"0.4)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: color+"0.1)",
                            data:[]
                        };
                        for (var i=this.meta.min_row;i<=this.meta.max_row;++i)
                            if(!this.meta.empty_rows[i])
                                item.data.push(this.meta.data[i+'-'+j]);

                        data.datasets.push(item);
                    }

                }else {
                    console.log('uni-col');
                    data.datasets = [{
                        label: this.meta.col_headers[this.meta.min_col],
                        fillColor: color+"0.7)",
                        strokeColor: color+"0.4)",
                        pointColor: color+"0.4)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: color+"0.1)",
                        data: []
                    }];
                    var count = {};
                    var item = [];
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if (!this.meta.empty_rows[i])
                            item.push(this.meta.data[i+'-'+this.meta.min_col]);

                    for(var i=0; i<item.length; ++i) {
                        if (count[item[i]]) {
                            ++count[item[i]];
                        }else {
                            data.labels.push(item[i]);
                            count[item[i]] = 1;
                        }
                    }
                    for(var i=0; i<data.labels.length; ++i)
                        data.datasets[0].data.push(count[data.labels[i]]);
                }
            }else {
                if(this.meta.min_row < this.meta.max_row || true ||
                    what == 'radar') {
                    for (var j=this.meta.min_col+1; j<=this.meta.max_col; ++j)
                        if(!this.meta.empty_cols[j])
                            data.labels.push(this.meta.col_headers[j]);
                    for (var i=this.meta.min_row; i<= this.meta.max_row; ++i){
                        if (this.meta.empty_rows[i]) continue;
                        color = "rgba("+this.random_color()+","+
                        this.random_color()+","+this.random_color()+",";
                        item = {
                            label: this.meta.row_headers[i],
                            fillColor: color+"0.7)",
                            strokeColor: color+"0.4)",
                            pointColor: color+"0.4)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: color+"0.1)",
                            data:[]
                        };
                        for (var j=this.meta.min_col+1;j<=this.meta.max_col;++j)
                            if(!this.meta.empty_cols[j])
                                item.data.push(this.meta.data[i+'-'+j]);

                        data.datasets.push(item);
                    }

                }else {
                    console.log('uni-col');
                    data.datasets = [{
                        label: this.meta.col_headers[this.meta.min_col],
                        fillColor: color+"0.7)",
                        strokeColor: color+"0.4)",
                        pointColor: color+"0.4)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: color+"0.1)",
                        data: []
                    }];
                    var count = {};
                    var item = [];
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if(!this.meta.empty_rows[i])
                            item.push(this.meta.data[i+'-'+this.meta.min_col]);

                    for(var i=0; i<item.length; ++i) {
                        if (count[item[i]]) {
                            ++count[item[i]];
                        }else {
                            data.labels.push(item[i]);
                            count[item[i]] = 1;
                        }
                    }
                    for(var i=0; i<data.labels.length; ++i)
                        data.datasets[0].data.push(count[data.labels[i]]);
                }
            }
            D = data;
            return data;
        },

        for_bar : function () {
            return this.for_column('bar');
        },

        for_line: function () {
            return this.for_column('line');
        },

        for_pie: function(what) {
            if (!what) waht = 'pie';
            var options = this.options || {col_data_series:true};
            var data = [];
            var color =  "rgba("+this.random_color()+","+
                this.random_color()+","+this.random_color()+",";

            if (options.col_data_series) {
                if(this.meta.min_col < this.meta.max_col) {
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if(!this.meta.empty_rows[i]) {
                            color =  "rgba("+this.random_color()+","+
                            this.random_color()+","+this.random_color()+",";
                            data.push({
                                label: this.meta.data[i+'-'+this.meta.min_col],
                                color: color+"0.7)",
                                highlight: color+"0.4)",
                                value: parseFloat(
                                    this.meta.data[i+'-'+this.meta.max_col])
                            });
                        }
                }else {
                    console.log('uni-col');
                    var count = {};
                    var item = [];
                    var labels = [];
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if (!this.meta.empty_rows[i])
                            item.push(this.meta.data[i+'-'+this.meta.min_col]);

                    for(var i=0; i<item.length; ++i) {
                        if (count[item[i]]) {
                            ++count[item[i]];
                        }else {
                            labels.push(item[i]);
                            count[item[i]] = 1;
                        }
                    }
                    for(var i=0; i<labels.length; ++i) {
                        color =  "rgba("+this.random_color()+","+
                        this.random_color()+","+this.random_color()+",";
                        data.push({
                            label: labels[i],
                            color: color+"0.7)",
                            highlight: color+"0.4)",
                            value: count[labels[i]]
                        });
                    }
                }
            }else {
                if(this.meta.min_row < this.meta.max_row) {
                    for (var j=this.meta.min_col+1; j<=this.meta.max_col; ++j)
                        if(!this.meta.empty_cols[j]) {
                            color =  "rgba("+this.random_color()+","+
                            this.random_color()+","+this.random_color()+",";
                            data.push({
                                label: this.meta.data[this.meta.min_row+'-'+j],
                                color: color+"0.7)",
                                highlight: color+"0.4)",
                                value: parseFloat(
                                    this.meta.data[this.meta.max_row+'-'+j])
                            });
                        }

                }else {
                    console.log('uni-col');
                    var count = {};
                    var item = [];
                    var labels = [];
                    for (var i=this.meta.min_row; i<=this.meta.max_row; ++i)
                        if(!this.meta.empty_rows[i])
                            item.push(this.meta.data[i+'-'+this.meta.min_col]);


                    for(var i=0; i<item.length; ++i) {
                        if (count[item[i]]) {
                            ++count[item[i]];
                        }else {
                            labels.push(item[i]);
                            count[item[i]] = 1;
                        }
                    }
                    for(var i=0; i<labels.length; ++i) {
                        color =  "rgba("+this.random_color()+","+
                        this.random_color()+","+this.random_color()+",";
                        data.push({
                            label: labels[i],
                            color: color+"0.7)",
                            highlight: color+"0.4)",
                            value: count[labels[i]]
                        });
                    }
                }
            }
            D = data;
            return data;
        },

        for_polar: function(){
            return this.for_pie('polar');
        },

        for_doughnut: function() {
            return this.for_pie('polar');
        },

        for_radar: function() {
            return this.for_column('radar');
        }
    });

    return ChartData;
}]);
/**
 * Created by tchapda gabi on 20/06/2015.
 */

sukuApp.factory('ChartViewService', ['Helper', 'ChartDataService', function (Helper, ChartData){

    var ChartDialog = Spine.Controller.sub({
        init: function () {
            this.el.addClass('chart-dialog');

            this.el.find('[data-toggle="tooltip"]').tooltip();
            this.legend = this.el.find('.chart-main .chart-legend');

            DragDrop.bind(this.el[0], {
                anchor:this.el.find('>.dialog-header')[0]});

            this.el.find('a[href="#close"]')
                .bind('click', this.proxy(this.close_hdl));


            this.canvas = this.el.find('canvas').get(0);
            this.textarea = this.el.find('textarea[name="range"]');

            if (this.view) {
                this.meta = this.view.graph_selection();
                this.view.chart = this;
            }else this.textarea.attr('disabled', true);

            this.regex_area = new RegExp(/([a-zA-Z]+[1-9][0-9]*:[a-zA-Z]+[1-9][0-9]*,\s*)*([a-zA-Z]+[1-9][0-9]*:[a-zA-Z]+[1-9][0-9]*)/gi);
            this.sregex = new RegExp(/^([a-zA-Z]+)([1-9][0-9]*):([a-zA-Z]+)([1-9][0-9]*)$/i);
            this.current_graph = 'bar';
            this.el.find('.tabs-view').tabs_view();
            this.bind_events();

            if (!this.meta) return;
            this.data = new ChartData(this.meta);
            window.chart = new Chart(this.canvas.getContext('2d')).Bar(this.data.for_bar());
            this.textarea.val(this.meta.cells_area);
            this.legend.get(0).innerHTML = window.chart.generateLegend();
        },

        switch_graph: function(graph) {
            this.current_graph = graph;
            if (window.chart) window.chart.destroy();
            if (graph == 'column') {
                window.chart = new Chart(this.canvas.getContext('2d')).
                    Bar(this.data.for_column());

            }else if (graph == 'line') {
                window.chart = new Chart(this.canvas.getContext('2d')).
                    Line(this.data.for_line());

            }else if (graph == 'pie') {
                window.chart = new Chart(this.canvas.getContext('2d')).
                    Pie(this.data.for_pie());

            }else if (graph == 'doughnut') {
                window.chart = new Chart(this.canvas.getContext('2d'))
                    .Doughnut(this.data.for_doughnut());

            }else if (graph == 'polar-area') {
                window.chart = new Chart(this.canvas.getContext('2d'))
                    .PolarArea(this.data.for_polar());

            }else if (graph == 'radar') {
                window.chart = new Chart(this.canvas.getContext('2d'))
                    .Radar(this.data.for_radar());

            }else if (graph == 'bar') {
                window.chart = new Chart(this.canvas.getContext('2d'))
                    .Bar(this.data.for_bar());

            }else {
                throw(graph+': unknow graph type');
                return;
            }
            this.legend.get(0).innerHTML = window.chart.generateLegend();
        },

        bind_events: function () {
            var that = this;
            this.el.find('.chart-left div[what="type"] img[graph]')
                .bind('click',
                function (evt) {
                    var $elt = $(evt.currentTarget);
                    that.switch_graph($elt.attr('graph'));
                    console.log($elt.attr('graph'));
                });

            this.textarea.bind('keyup',  this.proxy(this.new_selection_hdl));
            //this.textarea.bind('click',  this.proxy(this.new_selection_hdl));

            this.el.find('#rows').click(this.proxy(this.rows_series_hdl))
            this.el.find('#cols').click(this.proxy(this.cols_series_hdl))
        },

        rows_series_hdl : function () {
            this.data.options.col_data_series = false;
            this.switch_graph(this.current_graph);
        },

        cols_series_hdl : function () {
            this.data.options.col_data_series = true;
            this.switch_graph(this.current_graph);
        },

        new_selection_hdl : function(evt) {
            var area = this.select_area();
            if (!area) return;
            if (!this.view) return;
            this.view.selected = area;
            this.data = new ChartData(this.view.graph_selection());
            this.switch_graph(this.current_graph);
        },

        select_area : function (evt) {
            var area_str = this.textarea.val().trim();
            var str = area_str.match(this.regex_area);

            if (!str || str[0] != area_str) return false;
            if (!this.view) return;
            var max_row = this.view.hot.countRows();
            var max_col = this.view.hot.countCols();
            var rep, area = [], col;
            var a = 'a'.charCodeAt(0), A = 'A'.charCodeAt(0);
            var z = 'z'.charCodeAt(0), Z = 'Z'.charCodeAt(0);

            var tab = area_str.split(',');
            for(var i=0; i<tab.length; ++i) {
                rep = this.sregex.exec(tab[i].trim()) ;
                console.log({t:tab, i:i});
                var col = rep[1].charCodeAt(0);
                if (a <= col && z >= col) col -= a;
                if (A <= col && Z >= col) col -= A;
                rep[1] = col;

                col = rep[3].charCodeAt(0);
                if (a <= col && z >= col) col -= a;
                if (A <= col && Z >= col) col -= A;
                rep[3] = col;

                rep[2] = parseInt(rep[2])-1;
                rep[4] = parseInt(rep[4])-1;

                area.push([rep[2],rep[1],rep[4],rep[3]]);
            }

            this.view.select_area(false);
            for (var i=0; i<area.length; ++i)
                this.view.select_area(area[i]);
            return area;
            console.log(area);
        },

        export_meta : function () {
            return helper.obj2str(this.meta);
        },

        save_chart_hdl : function (evt) {
            evt.preventDefault();
            var file, $elt = $(evt.currentTarget);
            console.log($elt);
            if(!this.file) {
                var file_name = prompt('file name: ');
                if (file_name == null) return;
                file = new File2({name:file_name, type:2});
            }else file = this.file;

            file.data = this.export_meta();
            if (!file.save()) {
                notification.show();
                notification.hide(5000, file.validate());
                return;
            }
            this.file = file;
            notification.show('file saved. <a href="#files"> see folder</a>',
                true);
        },

        close_hdl: function (evt) {
            evt.preventDefault();
            this.el.removeClass('active');
        },

        show: function () {
            console.log('show');
            this.meta = this.view.graph_selection();
            this.data = new ChartData(this.meta);
            this.switch_graph(this.current_graph);
            this.textarea.val(this.meta.cells_area);
            this.el.addClass('active');
        }
    });

    return ChartDialog;
}]);
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
/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('ExcelColumnViewService', ['Helper', function (Helper){

    var Column = Spine.Class.sub({
        init : function () {
            var args = arguments[0];
            if (!args) throw ('view, header must be specified');
            $.extend(this, args);
            if (!this.name)
                throw('name is required for each header');
            this.index = this.index || this.name;
            this.mfield = this.mfield || this.index;

            this.col_index = this.view.columns.length;
            if (this.col_index == 26) throw({message:'maximum column reached',
                name:'max_column_exception'});
            this.arcs = [];
            if (!this.items) this.items = [];
            if (this.formula)
                this.item_strategy = new Column_fct_strategy({column:this});
            else
                this.item_strategy = new Column_item_strategy({column:this});


            this.view.bind('cell-changed', this.proxy(this.view_changed));
            if (this.model) this.items = this.model.records;
            console.log(this.items);
        }
    });
    Column.include(Helper.Events);
    Column.include({
        item : function (row) {
            return this.item_strategy.item(row);
        },

        type : function () {
            return this.item_strategy.type;
        },

        set_data : function (row, data) {
            this.item_strategy.set_data(row, data);
        },

        view_changed : function (evt, cell) {
            //console.log({row:cell.row, col:cell.col, col_index:this.col_index, data:cell.data, evt:evt});
            if (cell.col != this.col_index) return;
            this.set_data(cell.row, cell.data);
            this.trigger('changed', cell);
        },

        linked_column_changed : function (evt, cell) {
            //console.log({row:cell.row, col:cell.col, item:this.item(cell.row),evt:evt});
            this.view.addOne(this.item(cell.row), cell.row, this.col_index);
        },

        depends_to : function(column) {
            if (this.item_strategy.type == 'item') return false;
            for (var i=0; i<this.arcs.length; ++i) {
                if (this.arcs[i] == column.col_index)  return true;
            }

            for (var i=0; i<this.arcs.length; ++i) {
                if (this.view.columns[this.arcs[i]].depends_to(column))
                    return true;
            }
            return false;
        }
    });

    var Column_item_strategy = Spine.Class.sub({
        init : function () {
            var args = column = arguments[0];
            $.extend(this, args);
            this.type = 'item';
        }
    });
    Column_item_strategy.include({
        item : function (row) {
            if (this.column.items[row])
                return this.column.items[row];
            else {
                var mfield = this.column.mfield;
                var item = {};
                item[mfield] = null;
                this.column.items[row] = item;
            }
            return this.column.items[row];
        },

        set_data : function (row, data) {
            var item = this.item(row);
            item[this.column.mfield] = data;
        }
    });

    var Column_fct_strategy = Spine.Class.sub({
        init : function () {
            var args = arguments[0];
            $.extend(this, args);
            this.type = 'fct';
            this.node = math.parse(this.column.formula);
            this.code = this.node.compile(math);
            this.vars = this.node.filter(function(node) {
                return node.type == 'SymbolNode' &&
                node.name.match(/[a-zA-Z]+[1-9]+/g);
            });

            var fcts = this.node.filter(function(node) {
                return node.type == 'FunctionNode' && !math[node.name]
            });
            if (fcts.length) {
                var msg = '';
                for (var i=0; i<fcts.length; ++i) {
                    msg += fcts[i].name;
                    if (i != fcts.length -1 )
                        msg += ', ';
                }
                msg += ' unknown function(s)';
                throw({name: 'unknow params', message:msg});

            }
            /*from now we manage cells from a-z. after we'll take care
             of cells from aa-zz
             */
            this.cell0 = [];
            var col, row, a = 'a'.charCodeAt(0), A = 'A'.charCodeAt(0);
            var z = 'z'.charCodeAt(0), Z = 'Z'.charCodeAt(0);

            var already = {};
            for (var i=0; i<this.vars.length; ++i) {
                col = this.vars[i].name.match(/[a-zA-Z]+/)[0].charCodeAt(0);
                if (a <= col && z >= col) col -= a;
                if (A <= col && Z >= col) col -= A;
                row = parseInt(this.vars[i].name.match(/[1-9]+/)[0])-1;
                this.cell0.push({i:row, j:col});
                if (!already[col]) {
                    already[col] = true;
                    this.column.arcs.push(col);
                    if (!this.column.view.columns[col]) {
                        var msg = this.vars[i].name.match(/[a-zA-Z]+/)[0];
                        msg = 'column '+msg+' not yet defined ';
                        throw({ name:'unknow column',   message:msg });
                    }
                    this.column.view.columns[col].bind
                    ('changed', this.column.proxy(
                            this.column.linked_column_changed)
                    );
                }
            }
            console.log(this.column.view);
            for(var row=0, max =  row<this.column.view.hot.countRows(); row < max; ++row) {
                this.item(row);
            }
        }
    });
    Column_fct_strategy.include( {
        item : function (row) {
            var col_vars = {};
            for(var i=0; i<this.vars.length; ++i) {
                col_vars[this.vars[i]] =
                    this.column.view.data(row+this.cell0[i].i, this.cell0[i].j);
            }

          //  console.log(col_vars);
           // console.log(this.code.toString());
            var mfield = this.column.mfield;
            if (this.column.items[row])
                this.column.items[row][mfield] = this.code.eval(col_vars);
            else {
                var item = {};
                item[mfield] = this.code.eval(col_vars);
                this.column.items[row] = item;
            }
            return this.column.items[row];
        },

        set_data : function (row, data) {}
    });

    Column.ItemStrategy = Column_item_strategy;
    Column.FctStrategy = Column_fct_strategy;

    return Column;
}]);
/**
 * Created by tchapda gabi on 12/06/2015.
 */


sukuApp.factory('ExcelViewService', ['Helper', 'ExcelColumnViewService', 'ChartViewService', '$rootScope', function (Helper, Column, ChartDialog, $rootScope){

    var Views = [];

    var Edit_Menu_Actions = {
        undo_hdl : function (evt) {
            evt.preventDefault();
            this.hot.undo();
        },

        redo_hdl : function (evt) {
            evt.preventDefault();
            this.hot.redo();
        },

        copy_hdl : function (evt) {
            evt.preventDefault();
            this.buf = this.hot.getValue();
        },

        cut_hdl : function (evt) {
            evt.preventDefault();
            this.buf = this.hot.getValue();
            var cell;
            cell = this.hot.getSelected();
            this.hot.setDataAtCell(cell[0], cell[1], null);
        },

        paste_hdl : function (evt) {
            evt.preventDefault();
            var cell;
            cell = this.hot.getSelected();
            this.hot.setDataAtCell(cell[0], cell[1], this.buf);
        }
    };

    var Insertion_Menu_Actions = {
        add_graph_hdl : function (evt) {
            evt.preventDefault();
            var selection = this.graph_selection();
            console.log(this.chart);
            this.chart.show();
        },

        insert_col_hdl : function (evt) {
            evt.preventDefault();

            console.log('insert_col_hdl');/*
            uiCtrls['insert-column-dialog'].set_view(this);
            uiCtrls['insert-column-dialog'].show();*/
        },

        insert_col_bind_dialog : function (view_id, col_str) {
            console.log({id:view_id, col:col_str});
            if (view_id != this.id) return;
            var item = col_str.split('&');
            var json_attr = {}, field;
            for(var i=0; i<item.length; ++i) {
                field = item[i].split('=');
                json_attr[field[0]] = field[1];
            }
            var column_args = {
                view:this,
                name: json_attr.title,
                items:[]
            };

            if (json_attr['content-type'] == '2')
                column_args.formula = json_attr['formula'];
            if (json_attr['content-type'] == '3') {
                column_args.model = this.model;
                column_args.mfield = json_attr['attr']

                for (var j=0, max = this.model.count(); j<max; ++j)
                    column_args.items.push(this.model.records[j]);
            }
            this.add_column(column_args);
        },

        remove_col_hdl : function (evt) {
            evt.preventDefault();
            var selection = this.hot.getSelected(), min, max;
            if (selection && selection.length) {
                min = selection[1];
                max = selection[3];
            }
            for (var index = min; index <= max; ++index)
                this.columns.remove(index);
            console.log({min:min, max:max});
        },

        insert_row_hdl : function (evt) {
            evt.preventDefault();
            var selection = this.hot.getSelected(), min, max;
            if (selection && selection.length) {
                min = selection[0];
                max = selection[2];
            }else max = this.hot.countRows();
            this.hot.alter('insert_row', max+1);
        },

        remove_row_hdl : function (evt) {
            evt.preventDefault();
            var selection = this.hot.getSelected(), min, max;
            if (selection && selection.length) {
                min = selection[0];
                max = selection[2];
            }else return;
            console.log({min:min, max:max});
            for (var index = min; index <= max; ++index)
                this.hot.alter('remove_row', index);
        }
    };


    var ExcelView = Spine.Class.sub({
        init: function () {
            var args = arguments[0];
            if (!args) throw ('id, headers must be specified');

            var that = this;
            this.columns = [];
            this.columns.remove = function (index) {
                console.log({what: 'remove', index: index});
                if (!index) return;
                column = this.splice(index, 1)[0];
                for (var i = index; i < this.length; ++i)
                    this[i].col_index = i;

                that.hot.alter('remove_col', index);
                var current;
                /*we transform the columns that formula depends on this
                 column into a column_item_strategy
                 */
                for (var i = 0; i < this.length; ++i) {
                    current = this[i];
                    for (var j = 0; j < current.arcs.length; ++j) {
                        if (current.arcs[j] == index) {
                            current.item_strategy =
                                new Column.ItemStrategy({column: current});
                            break;
                        }
                    }
                }
                /*we update the formulas of the columns that depend
                 on a column after the delete one
                 */
                var cell0;
                for (var i = index + 1; i < this.length; ++i) {
                    if (this[i].type() == 'item') continue;
                    cell0 = this[i].item_strategy.cell0;
                    for (var k = 0; k < cell0.length; ++k) {
                        if (cell0[k].j >= index) --cell0[k].j;
                    }
                }

                /*we update the arcs of the columns that depend on columns
                 whose number has been modified by the deletion
                 */

                for (var i = 0; i < this.length; ++i) {
                    current = this[i];
                    for (var j = 0; j < current.arcs.length; ++j) {
                        if (current.arcs[j] >= index) --current.arcs[j];
                    }
                }
            };
            this.state = {is_rendering : true};
            this.headers = args['headers'];

            this.el = args['el'];
            this.table = this.el.find('.excel-tab');
            if (this.el.attr('id')) {
                Views[this.el.attr('id')] = this;
                this.id = this.el.attr('id');
            }
            this.initialize();
        }
    });

    ExcelView.getViewById = function (id) {
        return Views[id];
    };

    ExcelView.include(Insertion_Menu_Actions);
    ExcelView.include(Edit_Menu_Actions);


    ExcelView.include({
        initialize: function () {
            var col_header = [];
            for (var i = 0; i < this.columns.length; ++i) {
                col_header.push(this.columns[i].name);
            }
            var that = this;
            var height = screen.availHeight - 250 - 50;
            height = 500;

            //if (this.columns.length) {
                this.hot = new Handsontable(this.table[0], {
                    data: [[]],
                    colHeaders: function (index) {
                        return that.columns[index].name;
                    },
                    outsideClickDeselects: false,
                    rowHeaders: true,
                    stretchH: 'none',
                    /*fixedColumnsLeft:1,
                     fixedRowsTop:1,*/

                    autoWrapRow: true,
                    minSpareRows: 0,
                    manualRowResize: true,
                    manualColumnResize: true,
                    height:height,/*
                     manualColumnMove: true,
                     contextMenu: true,*/
                    'beforeKeyDown': this.proxy(this.before_key_down),
                    'beforeRender': this.proxy(this.before_render),
                    'afterRender': this.proxy(this.after_render),
                    'afterChange': this.proxy(this.after_change),
                    'beforeChange': this.proxy(this.before_change),
                    'afterOnCellMouseDown': this.proxy(this.myMultipleHS),
                    'afterSelectionEnd': this.proxy(this.after_selection_end)
                });
            /*} else {
                this.hot = new Handsontable(this.table[0], {
                    data: [[]],
                    colHeaders: function (index) {
                        if (that.columns[index])
                            return that.columns[index].name;
                        else return index;
                    },

                    outsideClickDeselects: false,
                    stretchH: 'none',
                    height:height,
                    rowHeaders: true,
                    manualRowResize: true,
                    manualColumnResize: true,
                    contextMenu: true,
                    'afterRender': this.proxy(this.after_render),
                    'beforeChange': this.proxy(this.before_change),
                    'afterChange': this.proxy(this.after_change),
                    'afterOnCellMouseDown': this.proxy(this.myMultipleHS),
                    'afterSelectionEnd': this.proxy(this.after_selection_end),
                    minSpareRows: 0
                });
            }*/
            this.selected = [];
            this.hot_table = $(this.hot.table);
            this.hot_table = this.table;
            this.bind_events();
            var that = this;
            this.hot.updateSettings({
                cells: function (row, col) {
                    if ((that.model && that.columns[col].model) && that.columns[col].model.Name == that.model.Name)
                        return {readOnly: true};
                }
            });


            var arg;
            for (var i = 0; i < this.headers.length; ++i) {
                console.log(this.headers[i]);
                arg = $.extend({view:this}, this.headers[i]);
                console.log(arg);
                this.columns.push(new Column(arg));
            }
        },

        adjust : function () {
            var w_h = $(window).height();
            var top = this.el.offset().top;
            this.hot.updateSettings({height: w_h-top-80});
        },

        bind_events : function () {
            this.adjust();
            $(window).bind('resize', this.proxy(this.adjust));
            this.top_menu = this.el.find('.top-menu:first');


            this.top_menu.find('[href="#edit-item"]')
                .bind('click', this.proxy(this.edit_item_hdl));
            this.top_menu.find('[href="#del-item"]')
                .bind('click', this.proxy(this.delete_item_hdl));
            this.top_menu.find('[href="#undo"]')
                .bind('click', this.proxy(this.undo_hdl));
            this.top_menu.find('[href="#redo"]')
                .bind('click', this.proxy(this.redo_hdl));
            this.top_menu.find('[href="#cut"]')
                .bind('click', this.proxy(this.cut_hdl));
            this.top_menu.find('[href="#copy"]')
                .bind('click', this.proxy(this.copy_hdl));
            this.top_menu.find('[href="#paste"]')
                .bind('click', this.proxy(this.paste_hdl));

            this.top_menu.find('[href="#remove-row"]')
                .bind('click', this.proxy(this.remove_row_hdl));
            this.top_menu.find('[href="#remove-col"]')
                .bind('click', this.proxy(this.remove_col_hdl));

            this.top_menu.find('[href="#add-graph"]')
                .bind('click', this.proxy(this.add_graph_hdl));

            this.top_menu.find('[href="#insert-row"]')
                .bind('click', this.proxy(this.insert_row_hdl));
            this.top_menu.find('[href="#insert-col"]')
                .bind('click', this.proxy(this.insert_col_hdl));

            /*
            uiCtrls['insert-column-dialog']
                .bind('insert-col', this.proxy(this.insert_col_bind_dialog));*/
        },

        export_data: function () {
            var data = '';
            for (var i = 0; i < this.columns.length; ++i) {
                data += this.columns[i].name;
                if (i != this.columns.length - 1) data += '\t';
            }
            data += '\n';
            data += this.hot.getCopyableData(0, 0, this.hot.countRows() - 2,
                this.hot.countCols() - 1);
            return data;
        },

        graph_selection: function () {
            var rep = {
                data: {}, cells_area: '',
                col_headers: {}, row_headers: {},
                empty_cols: {}, empty_rows: {},
                min_row: this.hot.countRows() - 1, max_row: 0,
                min_col: this.hot.countCols() - 1, max_col: 0
            };


            if (!this.selected.length) return null;
            var selection = this.selected;

            for (var k = 0; k < selection.length; ++k) {
                if (rep.min_row > selection[k][0]) rep.min_row = selection[k][0];
                if (rep.max_row < selection[k][2]) rep.max_row = selection[k][2];

                if (rep.min_col > selection[k][1]) rep.min_col = selection[k][1];
                if (rep.max_col < selection[k][3]) rep.max_col = selection[k][3];

                for (var row = selection[k][0]; row <= selection[k][2]; ++row) {
                    for (var col = selection[k][1]; col <= selection[k][3]; ++col) {
                        rep.data[row + '-' + col] = this.hot.getDataAtCell(row, col);
                        rep.empty_rows[row] = true;
                        rep.empty_cols[col] = true;
                    }
                }
                rep.cells_area += Helper.pos2char(selection[k][1]) +
                (selection[k][0] + 1) + ':' + Helper.pos2char(selection[k][3]) +
                (selection[k][2] + 1);
                if (k != selection.length - 1) rep.cells_area += ',';
            }

            for (var row = rep.min_row; row <= rep.max_row; ++row) {
                rep.row_headers[row] = this.hot.getDataAtCell(row, rep.min_col);
                rep.empty_rows[row] = !rep.empty_rows[row];
            }

            for (var col = rep.min_col; col <= rep.max_col; ++col) {
                rep.col_headers[col] = this.columns[col].name;
                rep.empty_cols[col] = !rep.empty_cols[col];
            }
            return rep;
        },

        before_key_down: function (evt) {
            if ((evt.keyCode == 13 || (evt.keyCode <= 40 && evt.keyCode >= 37))
                && !evt.ctrlKey) {
                this.select_area(false);
                this.selected = [];
            }
        },

        select_area: function (selection) {
            if (!selection) {
                this.hot_table
                    .find('tbody .cell-area').removeClass('cell-area');
                return;
            }
            for (var row = selection[0]; row <= selection[2]; ++row) {
                this.hot_table.find('tbody tr:eq(' + row + ')')
                    .each(function () {
                        for (var col = selection[1]; col <= selection[3]; col++) {
                            $(this).find('td:eq(' + col + ')')
                                .addClass('cell-area');
                        }
                    });
            }
        },

        after_render: function (isForced) {

            if (!this.selected) return;
            for (var i = 0; i < this.selected.length; ++i)
                this.select_area(this.selected[i]);
        },

        before_render: function (isForced) {
            console.log(this.state.is_rendering);
        },

        after_selection_end: function (row1, col1, row2, col2) {
            var selection = [row1, col1, row2, col2];
            this.selected.push(selection);
            this.select_area(selection);
        },

        myMultipleHS: function (event, coords, td) {
            if (!event.ctrlKey) {
                this.selected = [];
                this.select_area(false);

                /*"myMultipleHS" is called after "after_selection_end"*/
                if (coords.row == -1 || coords.col == -1) {
                    var selection = this.hot.getSelected();
                    this.after_selection_end(selection[0], selection[1],
                        selection[2], selection[3]);
                }
            }
        },

        before_change: function (meta, evt) {
            if (!meta) return;
            var i = meta[0][0], j = meta[0][1], data = meta[0][3];
            var meta_cell = this.hot.getCellMeta(i, j);
            var column = this.columns[j];
            var model = column.model;

            if (model == this.model) return true;

            if (model && meta_cell.model_id) {
                var elt = model.find(meta_cell.model_id);
                if (elt) {
                    if (elt[column.mfield] != data) {
                        elt[column.mfield] = data;
                        console.log('after-change-save');
                        if (elt.validate()) return false;
                        elt.save();
                    }
                }
            }
        },

        after_change: function (meta, evt) {
            if (!meta) return;
            var i = meta[0][0], j = meta[0][1], data = meta[0][3];
            this.trigger('cell-changed', {row: i, col: j, data: data});
        },

        setModel: function (model) {
            this.model = model;
            for (var i = 0; i < this.columns.length; ++i) {
                if ((model && this.columns[i].model) && this.columns[i].model.Name != model.Name || this.columns[i].items) continue;
                for (var j = 0, max = model.count(); j < max; ++j)
                    this.columns[i].items.push(model.records[j]);
            }
            this.item_id2view_row = {};
            this.addAll();
        },

        setItems: function (items) {
            this.columns = {};
            this.columns.length = 0;
            //this.hot_table.css('display', 'none');
            for (var i = 0; i < items[0].length; ++i) {
                this.hot.alter('insert_col');
                this.columns[i] = {name: items[0][i]};
                ++this.columns.length;
            }
            for (var i = 1; i < items.length; ++i) {
                for (var j = 0; j < items[i].length; ++j)
                    this.hot.setDataAtCell(i, j, items[i][j]);
            }
            this.hot.alter('remove_row', 0);
            console.timeEnd('set-items');
            //this.hot_table.css('display', 'block');
        },

        addAll: function () {
            console.time('addll');
            this.el.find('[loading-gif]').css('display', 'block');
            this.hot_table.css('display', 'none');
            this.state.is_rendering = true;
            console.log(this.columns);
            for (var col = 0; col < this.columns.length; ++col){
                //console.log(this.columns[col].items);
                for (var row = 0; row < this.columns[col].items.length; ++row){
                    this.addOne(this.columns[col].item(row), row, col);
                    //console.log(this.columns[col].item(row), row, col);
                }
            }
            this.hot.clearUndo();

            this.state.is_rendering = false;
            this.hot_table.css('display', 'block');
            this.hot.render();
            this.el.find('[loading-gif]').css('display', 'none');
            console.timeEnd('addll');
        },

        data: function (i, j) {
            return this.hot.getDataAtCell(i, j);
        },

        setData: function (i, j, data) {
            this.hot.setDataAtCell(i, j, data);
        },

        addOne: function (item, row, col) {

            if (col == undefined) {
                //this.hot.alter('insert_row');
                var count = this.hot.countRows() - 1;
                for (var i = 0; i < this.columns.length; ++i) {
                    this.hot.setDataAtCell(count, i,
                        item[this.columns[i].mfield]);
                    this.hot.setCellMeta(count, i, 'model_id', item.id);
                }
                this.item_id2view_row[item.id] = count;


            } else {
                this.hot.setDataAtCell(row, col,
                    item[this.columns[col].mfield]);
                this.hot.setCellMeta(row, col, 'model_id', item.id);
                if (col == 0) this.item_id2view_row[item.id] = row;
            }
        },

        updateOne: function (item) {
            var row = this.item_id2view_row[item.id];
            for (var col = 0, max = this.columns.length; col < max; ++col) {
                if (this.columns[col].model != this.model) continue;
                this.hot.setCellMeta(row, col, 'key', false);
                this.hot.setDataAtCell(row, col,
                    item[this.columns[col].mfield]);
            }
        },

        removeOne: function (item) {
            var meta;
            for (var i = 0, count = this.hot.countRows(); i < count; ++i) {
                meta = this.hot.getCellMeta(i, 0);
                if (meta.model_id == item.id) {
                    this.hot.alter('remove_row', i);
                    return;
                }
            }
        },

        /*if we hide the table before adding the column, we improve the
         performance*/
        add_column: function (column_args) {
            var column;
            column = new Column(column_args);
            this.columns.push(column);
            console.log('hide');
            this.hot_table.css('display', 'none');
            this.hot.alter('insert_col');//, this.columns.length-1);

            for (var row = 0, count = this.hot.countRows(),
                     max = this.columns.length - 1; row < count; ++row)
                this.addOne(column.item(row), row, max);

            this.hot_table.css('display', 'block');
            console.log('show');
        },

        html: function () {
            this.hot.render();
            return this.el;
        }
    });
    ExcelView.include(Helper.Events);

    return ExcelView;
}]);
/**
 * Created by tchapda gabi on 30/05/2015.
 */

sukuApp.factory('Helper', [function () {
    var helper = {};

    helper.truncate = function(str, max){
        if(!str) return '';
        if (max <= 3) return str.slice(0, max);
        if (str.length > max) {
            var str2 = str.slice(0, max);
            str2 = str2.split('');
            str2[max-3] = str2[max-2] = str2[max-1] = '.';
            return helper.present(str2.join(''));
            console.log(str2);
        }
        return helper.present(str);
    };

    helper.present = function(str) {
        if (!str) return '';
        var parse = /\+/g;
        return str.replace('%40', '@').replace(/\+/g, ' ');
    };

    helper.cr2br = function (str) {
        if (!str) return '';
        var parse = /\+/g;
        return str.replace(/\n/g, '<br/>');
    };

    helper.id2hash_h = function (id, n) {
        var hash = id.split('-')[1];
        if (!hash) return id;
        if (!n) n = 5;

        var result = '0';

        hash = parseInt(hash);
        for (var i=n; i>=0; --i) {
            if (hash < Math.pow(10, i)) result += '0';
            else {
                result += hash;
                break;
            }
        }
        return result;
    };

    helper.id2hash = function (id, n) {
        var parts = id.split('_');
        var result = '';
        for (var i=0; i<parts.length; ++i) {
            result += helper.id2hash_h(parts[i], n);
            if (i != parts.length -1 )
                result += '_';
        }
        return result;
    };


    helper.hash2id = function (hash) {
        var result = '';
        var parts = hash.split('_');
        for (var i=0; i<parts.length; ++i) {
            result += 'c-'+parseInt(parts[i]);
            if (i != parts.length -1 )
                result += '_';
        }
        return result;
    };

    helper.obj2str = function (obj) {
        var str = '{', max=0, i=0;
        for (var attr in obj) ++max;
        for (var attr in obj) {
            str += '"'+attr+'":';
            if (typeof obj[attr] == 'number' || typeof obj[attr] == 'boolean') {
                str += obj[attr];
            }else if (typeof obj[attr] == 'string') {
                str += '"'+obj[attr]+'"';
            }else if (typeof obj[attr] == 'object') {
                str += helper.obj2str(obj[attr]);
            }
            if (++i != max) str += ',';
        }
        str += '}';
        return str;
    };

    helper.email2jid = function (email) {
        return email.replace('@', '-')+'@localhost';
    };
    helper.str2xcel = function (str) {
        var rows = str.split('\n'), row, data = [] ;
        for (var i=0; i<rows.length; ++i) {
            row = rows[i].split('\t');
            data.push(row);
        }
        return data;
    };

    helper.is_local_id = function (id) {
        var ids = id.split('-');
        if (ids.length != 2 || ids[0] != 'c') return false;
        for (var i=0; i<ids[1].length; ++i)
            if (ids[1][i] < '0' || ids[1][i] > '9') return false;
        return true;
    };

    helper.is_eval_finished = function(day) {
        console.log(localStorage.getItem('end'));
        if (localStorage.getItem('end')) return true;
        var t1 = 1427368230845;
        var t2 = new Date().getTime();
        var t = t2 - t1;
        if (t < 0 || t > day*86400000) {
            localStorage.setItem('end', true);
            console.log(t/86400000);
            return true;
        }
        return false;
    };

    helper.str2xcel = function (str) {
        var rows = str.split('\n'), row, data = [] ;
        for (var i=0; i<rows.length; ++i) {
            row = rows[i].split('\t');
            data.push(row);
        }
        return data;
    };

    helper.sexe_code = function (sexe) {
        if (sexe == 'Male') return 1;
        if (sexe == 'Female') return 2;
    };

    helper.mgp = function (a) {
        var value = parseInt(a);
        grade = null;
        if (value >= 0 && value < 4) grade = 'F';
        else if (value >= 4 && value < 6) grade = 'D-';
        else if (value >= 6 && value < 8) grade = 'D+';
        else if (value >= 8 && value < 10) grade = 'C-';
        else if (value >= 10 && value < 12) grade = 'C+';
        else if (value >= 12 && value < 14) grade = 'B-';
        else if (value >= 14 && value < 16) grade = 'B+';
        else if (value >= 16 && value < 18) grade = 'A-';
        else if (value >= 18 && value <=20) grade = 'A+';
        return grade;
    };

    math.mgp = helper.mgp;

    helper.success_fail = function (mark) {
        mark = parseFloat(mark);
        if (mark < 10) return 'Fail';
        else return 'Success';
    };
    math.success_fail = helper.success_fail;

    helper.sexe_mark = function (sexe, mark) {
        var mark = parseFloat(mark);
        sexe = helper.sexe_code(sexe);
        grade = null;
        if (sexe == 1 && mark >= 10) grade = 'Male-Success';
        else if (sexe == 1 && mark < 10) grade = 'Male-Fail';
        else if (sexe == 2 && mark >= 10) grade = 'Female-Success';
        else if (sexe == 2 && mark < 10) grade = 'Female-Fail';
        return grade;
    };
    math.sexe_mark = helper.sexe_mark;

    helper.depend_to = function (column) {
        for (var i=0; i<this.arcs.length; ++i) {
            if (this.arcs[i] == column.col_index)  return true;
        }

        for (var i=0; i<this.arcs.length; ++i) {
            if (test_cols[this.arcs[i]].depends_to(column))
                return true;
        }
        return false;
    };

    test_cols = [
        {depends_to: helper.depend_to, col_index:0, arcs:[1]},
        {depends_to: helper.depend_to, col_index:1, arcs:[5]},
        {depends_to: helper.depend_to, col_index:2, arcs:[4, 3]},
        {depends_to: helper.depend_to, col_index:3, arcs:[]},
        {depends_to: helper.depend_to, col_index:4, arcs:[]},
        {depends_to: helper.depend_to, col_index:5, arcs:[2]},
        {depends_to: helper.depend_to, col_index:6, arcs:[2]}
    ];


    /*
     Array.method('remove', function (index) {
     });
     */

    helper.alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'];
    helper.pos2char = function (pos) {
        return helper.alphabet[pos];
    };



    helper.Events = {
        bind: function(){
            if ( !this.o ) this.o = $({});
            this.o.bind.apply(this.o, arguments);
        },

        trigger: function(){
            if ( !this.o ) this.o = $({});
            this.o.trigger.apply(this.o, arguments);
        }
    };
    window.Helper = helper;
    return helper;
}]);
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
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.factory('Model', ['$q', '$http', 'PubSubService', 'NotificationService', 'trFilter', function($q, $http, Pubsub, Notification, tr){
    var Model = Spine.Model;

    Model.all = {};
    var Passive_save = {
        pupdate : function(options) {
            var clone, records;
            records = this.constructor.irecords;
            records[this.id].load(this.attributes());
            this.constructor.sort();
            clone = records[this.id].clone();
            return clone;
        },

        pcreate : function(options) {
            var clone, record;
            this.id || (this.id = this.cid);
            record = this.dup(false);
            this.constructor.addRecord(record);
            this.constructor.sort();
            clone = record.clone();

            return clone;
        },

        psave : function(options) {
            var error, record;
            if (options == null) {
                options = {};
            }
            if (options.validate !== false) {
                error = this.validate();
                if (error) {
                    this.trigger('error', error);
                    return false;
                }
            }
            record = this.isNew() ?
                this.pcreate(options) : this.pupdate(options);
            this.stripCloneAttrs();
            return record;
        }
    };

    Local_save = {};
    Local_save.lupdate = Spine.Model.prototype.update;
    Local_save.lsave = Spine.Model.prototype.save;
    Local_save.lcreate = Spine.Model.prototype.create;

    var AbstractModel_i = {
        to_json_str : function () {
            var attrs = this.constructor.attributes;
            var str = '{';
            for(i=0; i<attrs.length; ++i) {
                str += '"'+attrs[i]+'": "'+this[attrs[i]]+'"';
                if (i < attrs.length -1) str += ','
            }
            str += '}';
            return str;
        },

        to_http_str : function () {
            var attrs = this.constructor.attributes;
            var ss_attrs = [];
            for(i=0; i<attrs.length; ++i)
                if (this.constructor.is_ssa(attrs[i])) ss_attrs.push(attrs[i]);

            var str = '';
            for(i=0; i<ss_attrs.length; ++i) {
                str += ss_attrs[i]+'='+this[ss_attrs[i]];
                if (i < ss_attrs.length -1) str += '&'
            }
            return str;
        }
    };

    var AbstractModel_e = {
        find_by_sid : function (sid) {console.log(this.sids, sid, this.sids[sid]);
            if (this.sids) return this.sids[sid];
            return this.findByAttributes('sid', sid);
        }
    };


    var Server_destroy = {
        sdestroy: function () {
            var that = this;
            var url = this.constructor.url('destroy');

            var d = $q.defer();
            $http.get(url+'/'+this.sid).then(
                function (resp) {
                    var rep = resp.data;
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0){
                        d.reject(rep);
                    }
                    code = parseInt(rep.content);

                    if (code != 1) {
                        d.reject({msg:'Unable to delete item'});
                        return;
                    }

                    if (!that.constructor.mustHaveNode) {
                        d.resolve();
                        that.destroy();
                        return;
                    }
                    that.unsubscribe().then(function (){
                        console.log('ok unsubscribe');
                        d.resolve();
                        that.destroy();
                        return;
                    },function (e) {d.reject(e);});

                },function (e) {d.reject(e);}
            );

            return d.promise;
        }
    };
    var Server_save = {
        activate: function () {
            var M = this.constructor;
            var that = this;
            $http.post(M.url('activate')+'/'+this.sid).then(
                function() {
                    Pubsub.subscribe(M.Name+'-'+that.sid).then(function () {
                        Pubsub.getItems(M.Name+'-'+that.sid);
                    });
                    console.log('ok');
            });
        },

        save: function () {
            var url = this.constructor.url('save');
            var that = this;
            var msg = 'saving ' + (this.name || this.code || 'item');
            var url = this.sid ? url+'/'+this.sid : url+'/0';
            var response = $q.defer();
            if (this.validate()){
                console.log('lsave failed');
                response.reject({what:1, msg:this.validate()});
                return response.promise;
            }
    	    var first = !this.sid;
            console.log(url, this);
            $http.post(url, this).then(
                function(server_response) {
                    var rep = server_response.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);

                    if (rep.status != 0) {
                        that.destroy();
                        response.reject({what:2, msg:'bad id'});
                    }

                    var sid = rep.content;
                    console.log(sid);
                    that.sid = sid;
                    that.psave();
	            	if (that.constructor.mustHaveNode && first) {
			            Pubsub.createNode(that.node()).then(
				            function(){
                                that.comments = Pubsub.subs[that.node()] = [];
                                response.resolve(sid);
                            },
				            function(){ response.reject({what:13, msg:'unable to create node'}); }
			            );
			        }else {
                        response.resolve(sid);
			        }

                },
                function(error) {
                    response.reject(error);
                });
            return response.promise;
        }
    };

    var Server_fetch = {
        isFetched: false,
        isLoading: false,

        fetch : function (forceReload) {
            var url = this.url('fetch');

            var that = this;
            var response = $q.defer();
            if (this.isLoading) {
                response.reject({id:5, msg:'is already fetching'});
                return response.promise;
            }

            this.isLoading = true;

            if (this.isFetched && !forceReload) {
                response.resolve();
                this.isLoading = false;
                return response.promise;
            }
            console.log(url);
            $http.get(url).then(
                function(server_response) {
                    var rep = server_response.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0) {
                        response.reject(rep);
                        that.isFetched = false;
                        that.isLoading = false;
                        return;
                    }
                    var items = rep.content;

                    var active;
                    for(var i=0, max = items.length; i<max; ++i){
                        active = items[i].active;
                        console.log(items[i]);
                        var item = new that(items[i]);
                        if (!item.psave()) continue;
                        if (that.mustHaveNode) {
                            item.comments = Pubsub.subs[item.node()] = [];
                            console.log(active);
                            if (active == '2') item.activate();
                        }
                    }
                    response.resolve(items);
                    that.isFetched = true;
                    that.isLoading = false;
                },
                function(error) {
                    that.isFetched = false;
                    that.isLoading = false;
                    console.log(error);
                    response.reject(error);
                });
            return response.promise;
        },

        /*risk with managing forceReload coz the items will be duplicated*/
        fetch_one : function (sid, forceReload) {

            var url = this.url('fetch_one') + '/'+sid;
            var that = this;
            var response = $q.defer();
            console.log('fetch-one', url);
            if (!forceReload) {
                var item = that.find_by_sid(sid);
                if (item) {
                    response.resolve(item);
                    return response.promise;
                }
            }

            $http.get(url).then(
                function(resp) {
                    var rep = resp.data;
                    console.log(rep);
                    rep.status = parseInt(rep.status);
                    if (rep.status != 0) {
                        response.reject(rep);
                        return;
                    }
                    var item = rep.content;
                    console.log(item);

                    var active = item.active;
                    item = new that(item);
                    item.psave();
                    if (that.mustHaveNode) {
                        item.comments = Pubsub.subs[item.node()] = [];
                        console.log(active);
                        if (active == '2') item.activate();
                    }
                    response.resolve(item);
                },
                function(error) {
                    response.reject(error);
                });
            return response.promise;
        }
    };

 //


    Model.NodeHelper = {
        newItem: function (item) {
            if (!item.what) return true;
            var what = item.what.split(' ');
            if (what.indexOf());

            return true;
        }
    };


    Model.NodeHelper.Methods = {
        olds: [],

        share: function(email) {
            var that = this;
            var d = $q.defer();
            $http.post(that.constructor.url('share')+'/'+that.sid, {email:email}).then(
                function(resp){
                    var rep = resp.data;
                    rep.status = parseInt(rep.status);
                    var code = parseInt(rep.content);
                    if (rep.status != 0) {
                        console.log(rep);
                        that.share_error(code, d, email);
                        return;
                    }

                    if (code == 1) {
                        /*ok. we ask the email user if he wants to share
                         the test to
                         */
                        var content = {type:'info', link:that.constructor.Name+'/'+that.sid,
                                       msg:'shared '+(that.name || that.code)+' ('+that.constructor.Name+') with you'};
                        Notification.notify(Helper.email2jid(email), content);
                        d.resolve(code);
                    }else that.share_error(code, d, email);
                });

            return d.promise;
        },

        node: function () {
            return this.constructor.Name+'-'+this.sid;
        },

        publish: function (item) {
            return Pubsub.publish(this.node(), item);
        },

        unsubscribe: function() {
            return Pubsub.unsubscribe(this.node());
        },

        getOldComments: function () {
            var self = this;
            var d = $q.defer();

            if (self.loadedComments){
                d.resolve();
                return d.promise;
            }

            Pubsub.getItems(self.node()).then(
                function(items) {
                    $(items).find('body').each(
                        function(){
                            var item = JSON.parse($(this).text());
                            self.olds.push(item);
                        }
                    );
                    self.loadedComments = true;
                    d.resolve();
                },
                function(e){
                   console.log(e);
                    d.reject(e);
                }
            );
            return d.promise;
        }

    };

    Notification.conn.addHandler(Model.new_item, null, "message", null, null, Pubsub.service);


    Model.include(AbstractModel_i);
    Model.include(Local_save);
    Model.include(Passive_save);
    Model.extend(AbstractModel_e);
    Model.extend(Server_fetch);
    Model.include(Server_save);
    Model.include(Server_destroy);

    window.model = Model;
    return Model;
}]);

/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('NotificationService', ['Strophe', 'PubSubService', 'RegisterService', 'Helper', '$q', '$rootScope',  function (Strophe, Pubsub, Register, Helper, $q, $rootScope){
    
    var Notification = {
        olds: [],
        items: []
    };


    Notification.conn = Pubsub.conn;

    Notification.notify = function (jid, content) {
        jid = Strophe.getNodeFromJid(jid);
        console.log('users-'+jid, content);
        return Pubsub.publish('users-'+jid, content);
	};

    Notification.init = function (jid) {
        Notification.node = 'users-'+Strophe.getNodeFromJid(jid);
        console.log(Notification.node);
        Pubsub.subs[Notification.node] = Notification.items;
    }


    Notification.getNotifications = function (max, forceReload) {
        if (!max) max = 5;
        var d = $q.defer();
        if (!Notification.node) {
            d.reject();
            return d.promise;
        }

        if (Notification.loadedComments && !forceReload){
            d.resolve();
            return d.promise;
        }
        console.log(Notification.node);
        Pubsub.getItems(Notification.node, max).then(
            function(items) {
                $(items).find('item').each(
                    function(){
                        var item = JSON.parse($(this).find('body').text());
                        item.jiid = $(this).attr('id');
                        var index = -1;
                        for (var i=0; i<Notification.olds.length; ++i) {
                            if (Notification.olds[i].jiid == item.jiid) {
                                index = i;
                                break;
                            }
                        }
                        console.log(index, item);
                        if (index > -1) Notification.olds[index] = item;
                        else Notification.olds.unshift(item);
                    }
                );
                Notification.loadedComments = true;
                d.resolve(items);
            },
            function(e){
                console.log(e);
                d.reject(e);
            }
        );
        return d.promise;
    };

    Notification.readNotifications = function () {
        var d = $q.defer();
        if (Notification.olds.length == 0) d.resolve();

        var errors = [], reps = [];
        for (var i= 0, length = Notification.olds; i<Notification.olds.length; ++i) {
            var item = Notification.olds[i];
            item.type = 'read';
            console.log(item);
            Pubsub.publish(Notification.node, item).then(
                function(iq) {
                    reps.push(iq);
                    if (--length == 0){
                        if (errors.length == 0) d.resolve(reps); else d.reject(errors);
                    }
                },
                function (e) {
                    e = {msg:e, index: length};
                    errors.push(e);
                    if (--length == 0) d.reject(erros); else return e;
                }
            );
        }
    };

    window.notif = Notification;
    return Notification;
}]);

/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('PubSubService', ['Strophe', 'RegisterService', '$q', '$rootScope',  function (Strophe, Register, $q, $rootScope){
    
    var Pubsub = {
	    NS_DATA_FORMS : "jabber:x:data",
	    NS_PUBSUB : "http://jabber.org/protocol/pubsub",
	    NS_PUBSUB_OWNER : "http://jabber.org/protocol/pubsub#owner",
	    NS_PUBSUB_ERRORS : "http://jabber.org/protocol/pubsub#errors",
	    NS_PUBSUB_NODE_CONFIG : "http://jabber.org/protocol/pubsub#node_config",
	    items : [],
	    subs: {},
        handlers:[],
        resource: 'web'
    };
    
    Pubsub.conn = Register.conn;
    Pubsub.service = 'pubsub.'+Strophe.ServerAddr;


    Pubsub.sendIQq = function (iq) {
	    var d = $q.defer();
	    Pubsub.conn.sendIQ(iq, function (iq){d.resolve(iq);}, function (error) {d.reject(error)});
	    return d.promise;
    };

    Pubsub.createNode = function(node) {
        var iq = $iq({to: Pubsub.service, type: 'set'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
    	    .c('create', {node:node})
	        .up()
	        .c('configure')
    	    .c('x', {xmlns:Pubsub.NS_DATA_FORMS, type:'submit'})
	        .c('field', {'var': 'FORM_TYPE'})
	        .c('value').t(Pubsub.NS_PUBSUB_NODE_CONFIG)
    	    .up().up()
	        .c('field', {'var': 'pubsub#send_last_published_item'})
	        .c('value').t("never")
    	    .up().up()
	        .c('field', {'var': 'pubsub#publish_model'})
	        .c('value').t("open")
    	    .up().up()
	        .c('field', {'var': 'pubsub#expire_time'})
	        .c('value').t("31536000")
            .up().up()
            .c('field', {'var': 'pubsub#max_items'})
	        .c('value').t("1000");

	    return Pubsub.sendIQq(iq).then(function(){
            return Pubsub.subscribe(node);
	    });
    };
    
    Pubsub.deleteNode = function(node) {
	    var iq = $iq({to: Pubsub.service, type: 'set'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB_OWNER})
	        .c('delete', {node: node});
	
	    return Pubsub.sendIQq(iq);
    };

    Pubsub.configureNode = function(node) {
	
    };

    Pubsub.publish = function (node, item) {
        if (!item.jiid)
	        item.from = {name:Register.user.name, jid:Register.user.jid,img:Register.user.img, schools:Register.user.schools,
                         creation:Register.user.creation};
        item.date = new Date();
        if (!item.what) item.what = 'comment';

	    var iq;
        if (item.jiid) {
            iq = $iq({to: Pubsub.service, type: 'set'})
	            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
    	        .c('publish', {node: node})
	            .c('item', {id: item.jiid})
	            .c('entry', {xmlns:'http://www.w3.org/2005/Atom'})
	            .c('body').t(JSON.stringify(item));
        }else {
            iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('publish', {node: node})
                .c('item')
                .c('entry', {xmlns:'http://www.w3.org/2005/Atom'})
                .c('body').t(JSON.stringify(item));
        }

        return Pubsub.sendIQq(iq);
    };


    Pubsub.deleteItem = function (node, item_id) {
	
    };

    Pubsub.getItems = function (node, max) {
        var iq;
        if (max) iq = $iq({to: Pubsub.service, type: 'get'})
	                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
	                .c('items', {node: node, 'max_items': max});

        else  iq = $iq({to: Pubsub.service, type: 'get'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('items', {node: node});
	    return Pubsub.sendIQq(iq);
    };


    Pubsub.subscribe = function (node) {
	    if (Pubsub.resource && Strophe.getResourceFromJid(Pubsub.conn.jid) != Pubsub.resource) {
            var jid = Strophe.getBareJidFromJid(Pubsub.conn.jid)+'/'+Pubsub.resource;
            var iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('subscribe', {node: node, jid: jid});
            Pubsub.sendIQq(iq);
        }

        var iq = $iq({to: Pubsub.service, type: 'set'})
            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
            .c('subscribe', {node: node, jid: Pubsub.conn.jid});

	    return Pubsub.sendIQq(iq);
    };

    Pubsub.unsubscribe = function (node) {
        if (Pubsub.resource && Strophe.getResourceFromJid(Pubsub.conn.jid) != Pubsub.resource) {
            var jid = Strophe.getBareJidFromJid(Pubsub.conn.jid)+'/'+Pubsub.resource;
            var iq = $iq({to: Pubsub.service, type: 'set'})
                .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
                .c('unsubscribe', {node: node, jid: jid});
            Pubsub.sendIQq(iq);
        }

        var iq = $iq({to: Pubsub.service, type: 'set'})
            .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
            .c('unsubscribe', {node: node, jid: Pubsub.conn.jid});

        return Pubsub.sendIQq(iq);
    };

    Pubsub.getSubscriptions = function (node) {
	    var iq = $iq({to: Pubsub.service, type: 'get'})
	        .c('pubsub', {xmlns: Pubsub.NS_PUBSUB_OWNER})
	        .c('subscriptions', {node: node});
	    return Pubsub.sendIQq(iq);
    };
    
    Pubsub.getSubscriptionConfig = function (node) {
	    var iq = $iq({to: Pubsub.service, type: 'get'})
    	    .c('pubsub', {xmlns: Pubsub.NS_PUBSUB})
	        .c('options', {node: node, jid: Strophe.getBareJidFromJid(Pubsub.conn.jid)});
	    return Pubsub.sendIQq(iq);
    };

    Pubsub.addHandler = function (handler) {
        Pubsub.handlers.push(handler);
    };

    Pubsub.new_item = function (item) {
        console.log(item);
        var jitem = $(item).find('body').text();
        var item_id = $(item).attr('id');
        var node = $(item).find('items').attr('node');
        if (!jitem) return true;
        jitem = JSON.parse(jitem);
        jitem.jiid = item_id;
        $rootScope.$apply(function() {
            notifyng(jitem, node);
        });
	    return true;
    };

        
    Pubsub.conn.addHandler(Pubsub.new_item, null, "message", null, null, Pubsub.service);
    

    var notifyng = function (jitem, node) {
        if (!Pubsub.subs[node]) Pubsub.subs[node] = [];
        Pubsub.subs[node].unshift(jitem);
        Pubsub.items.unshift(jitem);
        return true;
    };

    window.pubsub = Pubsub;
    return Pubsub;
}]);

/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('RegisterService', ['Strophe',  '$q', function (Strophe, $q){
    var Register = {
	    conn: null
    };
    
    Register.conn = new Strophe.Connection(Strophe.BOSH_SERVICE);

    Register.register = function (user) {
	    console.log(user);
	    var d = $q.defer();
    	if (!Strophe.getNodeFromJid(user.jid)) user.jid += '@'+Strophe.ServerAddr+'/web';
	    var callback = function (status) {
	        if (status === Strophe.Status.REGISTER) {
		        Register.conn.register.fields.username =  Strophe.getNodeFromJid(user.jid);
                Register.conn.register.fields.resource = 'web';
        		Register.conn.register.fields.password = user.pwd;
	        	Register.conn.register.submit();
		        console.log('register');
    	    }else if (status === Strophe.Status.REGISTERED) {
	    	    console.log('registered');
		        Register.conn.authenticate();
		        //Register.connect(user);

    	    }else if (status === Strophe.Status.CONNECTED) {
	        	Register.user = user;
		        d.resolve();
	        }else if (status === Strophe.Status.CONNECTING || status === Strophe.Status.AUTHENTICATING) {

	        }else {
		        var msg;
        		if (status === Strophe.Status.CONFLICT) msg = 'This address is already taken';
	        	else if (status === Strophe.Status.REGIFAIL) msg = 'Registration failed';
		        else if (status === Strophe.Status.NOTACCEPTABLE) msg = 'Fields not acceptable';
		        else msg = 'ERROR';
		    msg += '. Unable to register your account';
		    d.reject({what:10, msg:msg});
	    }
	};
	
	    Register.conn.register.connect(Strophe.ServerAddr, callback);
	    return d.promise;
    };

    Register.connect = function (user) {
	    if (!Strophe.getNodeFromJid(user.jid)) user.jid += '@'+Strophe.ServerAddr+'/web';
	    var d = $q.defer();
	    console.log(user);
	    console.log(Strophe.Status);
	    var callback = function(status) {
            console.log(status);
	        if (status === Strophe.Status.CONNECTED) {
                Register.user = user;
    		    console.log(status, 'connected');
    		    d.resolve();
	    	}else if (status === Strophe.Status.CONNECTING || status === Strophe.Status.AUTHENTICATING) {
		        console.log(status, 'connecting');
    	    }else {
	        	console.log(status);
    		    var msg;
	    	    if (status === Strophe.Status.CONNFAIL) msg = 'Connection Error'; else msg = 'ERROR';
                console.log(status, msg);
		        d.reject({what:11, msg:msg});
	        }

	    };
	    Register.conn.connect(user.jid, user.pwd, callback);
	    return d.promise;
    };

    Register.disconnect = function () {
	    var d = $q.defer();
    	var callback = function(status) {

	        if (status === Strophe.Status.DISCONNECTED) {
		        console.log('disconnected');
		        d.resolve();
	        }else if (status === Strophe.Status.DISCONNECTING){

	        }else {
		        d.reject();
	        }
	    };

	    Register.conn.disconnect(callback);
	    return d.promise;
    };
    return Register;
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */
sukuApp.factory('ServerFileModel', ['Model', 'Helper', '$rootScope', '$q', '$http', function(Model, Helper, $rootScope, $q, $http){

    var Server_File = Model.sub();
    Server_File.configure('Server_File', 'file', 'src', 'alt', 'type', 'sid');

    Server_File.extend({
        url : function (what) {
            if (what == 'save') return '../server/add-server-file';
        }
    });

    Server_File.status = { loading: false, points: ''};

    Server_File.include({
        validate: function () {
            if (!this.type) return 'type is mandatory';
        },

        save: function () { /*server save*/
            var url = this.constructor.url('save')+'/'+this.type;
            var response = $q.defer();
            $rootScope.$apply(function() {
                Server_File.status.loading = true;
            });


            $.upload(url, this.file,
                {
                    upload: {
                        progress:function(){
                            $rootScope.$apply(function() {
                                Server_File.status.points += '.';
                                console.log('p', Server_File.status.loading);
                            });
                        }
                    },
                    success:function (rep){
                        $rootScope.$apply(function() {
                            Server_File.status.loading = false;
                            Server_File.status.points = '';
                        });
                        response.resolve(rep);
                    },
                    error: function (error){
                        $rootScope.$apply(function() {
                            Server_File.status.points = '';
                            Server_File.status.loading = false;
                        });
                        response.reject(error);
                    }
                }
            );
            return response.promise;
        }
    });
    Server_File.Helper = {
        addFile: function (file) {
            var d = $q.defer();
            var that = this;
            var file=new Server_File({file: file,type:0});
            file.psave();/*so that the file can have an id*/
            file.save().then(
                function (path) {
                    self.working = false;
                    if (path == '0') {
                        d.reject({msg:'Error while saving the file. Check that the extension and the size are correct'});
                        return;
                    }
                    console.log(path);
                    $http.post(that.constructor.url('add-file')+'/'+that.sid, {file:path}).then(
                        function(rep){
                            rep = rep.data;
                            console.log(rep);
                            rep.status = parseInt(rep.status);
                            if (rep.status != 0) {
                                d.reject({msg: 'Error while adding the file'});
                                return;
                            }
                            d.resolve();
                            that.files.push(path);
                            console.log(that);
                        },
                        function(){d.reject({msg:'Error while adding the file'});}
                    );
                }, function (error){
                    d.reject({msg:'Error while adding the file'});
                });

            return d.promise;
        }
    };


    return Server_File;
}]);
/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('Strophe', [function (){
    var Xmpp = Strophe;
    Xmpp.BOSH_SERVICE = 'http://localhost:5280/http-bind';
    Xmpp.ServerAddr = 'localhost';
    return Xmpp;
}]);
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
/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('TranslateService', [function (){
    var Translate =  {
        lang: 'en',
        elts: {}
    };

    Translate.lang = 'fr';

    // app/
    Translate.elts['Classrooms'] = {en: 'Classrooms', fr: 'Classes'};
    Translate.elts['Tests'] = {en: 'Tests', fr: 'Tests'};
    Translate.elts['Colleagues'] = {en: 'Colleagues', fr: 'Collegues'};
    Translate.elts['All classrooms'] = {en: 'All classrooms', fr: 'Toutes les classes'};
    Translate.elts['All tests'] = {en: 'All tests', fr: 'Tous les tests'};
    Translate.elts['Invite a colleague on sukull'] = {en: 'Invite a colleague on sukull', fr: 'Inviter un colleague sur sukull'};
    Translate.elts['Profile'] = {en: 'Profile', fr: 'Profil'};
    Translate.elts['Settings'] = {en: 'Settings', fr: 'Parametres'};
    Translate.elts['Logout'] = {en: 'Logout', fr: 'Deconnexion'};

    // app/contextual-menu
    Translate.elts['Open'] = {en: 'Open', fr: 'Ouvrir'};
    Translate.elts['Edit'] = {en: 'Edit', fr: 'Modifier'};
    Translate.elts['Delete'] = {en: 'Delete', fr: 'Supprimer'};

    // app/auth-modal
    Translate.elts['Your are not authenticated or your session has ended'] = {
        en: 'Your are not authenticated or your session has ended',
        fr: 'Vous n\'est pas connecte, ou votre session est terminee'
    };
    Translate.elts['Close'] = {en: 'Close', fr: 'Fermer'};
    Translate.elts['Sign in'] = {en: 'Sign in', fr: 'Se connecter'};

    // app/chart-view
    Translate.elts['Chart Editor'] = {en: 'Chart Editor', fr:'Editeur Graphique'};
    Translate.elts['Data range'] = {en: 'Data range', fr:'Domaine'};
    Translate.elts['Graphic type'] = {en: 'Graphic type', fr:'Type de Graphique'};
    Translate.elts['Column'] = {en: 'Column', fr:'Colonne'},
    Translate.elts['Line'] = {en: 'Line', fr: 'Ligne'},
    Translate.elts['Polar-Area'] = {en: 'Polar-Area', fr:'Polar-Area'};
    Translate.elts['Radar'] = {en: 'Radar', fr:'Radar'};
    Translate.elts['Pie, Doughnut'] = {en: 'Pie, Doughnut', fr: 'Pie, Doughnut'};
    Translate.elts['Data series in rows'] = {en: 'Data series in rows', fr: 'Series en ligne'};
    Translate.elts['Data series in columns'] = {en: 'Data series in columns', fr: 'Series en colonnes'};

    // app/classroom-properties-modal
    Translate.elts['Properties'] = {en: 'Properties', fr:'Proprietes'};
    Translate.elts['Effectif'] = {en: 'Effectif', fr: 'Effectif'};
    Translate.elts['Male'] = {en: 'Male', fr:'Homme'};
    Translate.elts['Female'] = {en: 'Female', fr: 'Femme'};
    Translate.elts['Attachments'] = {en: 'Attachments', fr: 'Fichies attaches'};
    Translate.elts['Attach a file'] = {en: 'Attach a file', fr:'Attacher un fichier'};
    Translate.elts['Activity'] = {en: 'Activity', fr:'Activite'};
    Translate.elts['comment'] = {en: 'comment', fr:'commentaire'};
    Translate.elts['Comment'] = {en: 'Comment', fr:'Commentez'}

    // app/execel-view
    Translate.elts['name'] = {en: 'name', fr: 'nom'};
    Translate.elts['sexe'] = {en: 'sexe', fr: 'sexe'};
    Translate.elts['Male'] = {en: 'Male', fr: 'Homme'};
    Translate.elts['Female'] = {en: 'Female', fr: 'Femme'};
    Translate.elts['Success'] = {en: 'Success', fr: 'Succes'};
    Translate.elts['Fail'] = {en: 'Fail', fr: 'Echec'};
    Translate.elts['result'] = {en: 'result', fr: 'resultat'};
    Translate.elts['sexe-result'] = {en: 'sexe-result', fr: 'sexe-resultat'};
    Translate.elts['appreciation'] = {en: 'appreciation', fr: 'appreciation'};
    Translate.elts['Male-Success'] = {en: 'Male-Success', fr: 'Homme-Succes'};
    Translate.elts['Female-Success'] = {en: 'Female-Success', fr: 'Femme-Succes'};
    Translate.elts['Male-Fail'] = {en: 'Male-Fail', fr: 'Homme-Echec'};
    Translate.elts['Female-Fail'] = {en: 'Female-Fail', fr: 'Femme-Echec'};
    Translate.elts['Undo'] = {en: 'Undo', fr: 'Annuler'};
    Translate.elts['Redo'] = {en: 'Redo', fr: 'Re-Annuler'};
    Translate.elts['Cut'] = {en: 'Cut', fr: 'Couper'};
    Translate.elts['Copy'] = {en: 'Copy', fr: 'Copier'};
    Translate.elts['Paste'] = {en: 'Paste', fr: 'Coller'};
    Translate.elts['Remove row'] = {en: 'Remove row', fr: 'Supprimer ligne'};
    Translate.elts['Remove column'] = {en: 'Remove column', fr: 'Supprimer colonne'};
    Translate.elts['Insert row'] = {en: 'Insert row', fr: 'Inserer ligne'};
    Translate.elts['Insert column'] = {en: 'Insert column', fr: 'Inserer colonne'};
    Translate.elts['Insert graphic'] = {en: 'Insert graphic', fr: 'Inserer un graphique'};
    Translate.elts['Editx'] = {en: 'Edit', fr:'Edition'};
    Translate.elts['Insert'] = {en: 'Insert', fr:'Insertion'};


    // app/import-students-modal
    Translate.elts['Upload the text file'] = {en: 'Upload the text file', fr: 'Uploader le fichier texte'};
    Translate.elts['You must import the students from a text file (.txt or .text)'] = {
        en: 'You must import the students from a text file (.txt or .text)',
        fr: 'Importez les eleves a partir d\' fichier texte (.txt or .text)'
    };
    Translate.elts['Each line in the file must contain the name of one student'] = {
        en: 'Each line in the file must contain the name of one student',
        fr: 'Chaque line du fichier devra contenir le nom d\'un eleve'
    };

    Translate.elts['If your student file is not a text file (pdf, excel, word, ...)'] = {
        en: 'If your student file is not a text file (pdf, excel, word, ...)',
        fr: 'Si votre fichier n\'est pas un fichier text (pdf, excel, word, ...)'
    };

    Translate.elts['open your text editor (notepad, bloc note, emacs ...)'] = {
        en:'open your text editor (notepad, bloc note, emacs ...)',
        fr:'ouverz votre editeur de texte (notepad, bloc note, emacs ...)'
    };

    Translate.elts['copy the students\' names in that file, each name on it\'s own line and save the file with the extension .txt or .text'] = {
        en: 'copy the students\' name in that file, each name on it\'s own line and save the file with the extension .txt or .text',
        fr: 'entrez le nom des eleves, chaque nom sur une sa ligne, et sauvegardez le fichier avec l\'extension .txt or .text'
    };

    Translate.elts['Then import it via this assistant.'] = {
        en: 'Then import it via this assistant.', fr: 'Ensuite, importez le fichier via l\'assistant'
    };

    Translate.elts['The other students\' information (email, phone ...) must be filled later'] = {
        en: 'The other students\' information (email, sexe ...) must be filled later',
        fr: 'Les autres informations (email, sexe ...) seront remplies plus tard'
    };

    Translate.elts['The imported students will be added to students already present in the classroom before'] = {
        en: 'The imported students will be added to students already present in the classroom before',
        fr: 'Les nouveaux eleves seront ajoutes a ceux precedemment presents dans la classe'
    };

    Translate.elts['Send'] = {en: 'Send', fr:'Envoyer'};

    // app/invite-user-modal
    Translate.elts['Enter your colleague\'s email'] = {en: 'Enter your colleague\'s email', fr:'Entrez l\'email de votre collegue'};
    Translate.elts['You may want to share some of your classroom with him'] =
        {en: 'You may want to share some of your classroom with him', fr:'Vous pouvez partager certaines de vos classes avec lui'};
    Translate.elts['Invite'] = {en: 'Invite', fr:'Inviter'};

    // app/save-classrooms-modal
    Translate.elts['Name'] = {en: 'Name', fr: 'Nom'};
    Translate.elts['School'] = {en: 'School', fr: 'Etablissement'};
    Translate.elts['Classroom'] = {en: 'Classroom', fr: 'classe'};
    Translate.elts['classroom name'] = {en: 'classroom name', fr: 'nom classe'};
    Translate.elts['school name'] = {en: 'school name', fr: 'nom etablissement'};


    Translate.elts['Save'] = {en: 'Save', fr: 'Sauvegarder'};


    // app/classrooms
    Translate.elts['New Classroom'] = {en: 'New Classroom', fr: 'Nouvelle Classe'};

    // app/classrooms/:id
    Translate.elts['New Test'] = {en: 'New Test', fr: 'Nouveau Test'};
    Translate.elts['New Student'] = {en: 'New Student', fr: 'Nouvel Eleve'};
    Translate.elts['Import Students'] = {en: 'Import Students', fr: 'Importer Eleves'};
    Translate.elts['Share Classroom'] = {en: 'Share Classroom', fr: 'Partager la Classe'};
    Translate.elts['Details'] = {en: 'Details', fr: 'Details'};
    Translate.elts['Code'] = {en: 'Code', fr: 'Code'};
    Translate.elts['Date'] = {en: 'Date', fr: 'Date'};
    Translate.elts['Subject'] = {en: 'Subject', fr: 'Matiere'};
    Translate.elts['Name'] = {en: 'Name', fr: 'Nom'};
    Translate.elts['Email'] = {en: 'Email', fr: 'Email'};
    Translate.elts['Sexe'] = {en: 'Sexe', fr: 'Sexe'};





    // app/tests/:id
    Translate.elts['Notify Students'] = {en: 'Notify Students', fr: 'Notifier les Eleves'};
    Translate.elts['Share Test'] = {en: 'Share Test', fr: 'Partager le Test'};




    Translate.tr = function(msg, $a, $b, $c, $d, $e, $f) {
        if (Translate.elts[msg]) return Translate.elts[msg][Translate.lang];
        return msg;
    };
    return Translate;
}]);
/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('XmppService', [function (){
    var Xmpp = Strophe;
    Xmpp.BOSH_SERVICE = 'http://localhost:5280/http-bind';
    return Xmpp; 
}]);
