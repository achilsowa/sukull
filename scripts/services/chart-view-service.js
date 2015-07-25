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
