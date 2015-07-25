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
