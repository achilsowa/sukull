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
