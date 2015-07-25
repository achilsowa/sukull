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
