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
