/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('authModal', [function() {
    return {
        templateUrl: 'views/auth-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Your are not authenticated or your session has ended': 'Your are not authenticated or your session has ended',
                'Please sign in again': 'Please sign in again',
                'Close': 'Close',
                'Sign in': 'Sign in'
            };
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('chartView', ['ChartViewService', function(ChartDialog) {
    return {
        templateUrl: 'views/chart-view.html',
        restrict:'AE',
        scope : {
            meta: '='
        },
        require: '?^excelView',

        link: function($scope, $element, $attrs, excelCtrl) {
            $scope.strs = {
                'Chart Editor': 'Chart Editor',
                'Data range': 'Data range',
                'Graphic type': 'Graphic type',
                'Column': 'Column',
                'Line': 'Line',
                'Polar-Area': 'Polar-Area',
                'Radar': 'Radar',
                'Pie, Doughnut': 'Pie, Doughnut',
                'Data series in rows': 'Data series in rows',
                'Data series in columns': 'Data series in columns'
            };


            var chart;
            if (excelCtrl)
                chart = new ChartDialog({view:excelCtrl.view, el: $element});

            else
                chart = new ChartDialog({meta:$scope.meta, el: $element});


            console.log(excelCtrl.state);
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('classroomPropertiesModal', [function() {
    return {
        templateUrl: 'views/classroom-properties-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Properties': 'Properties',
                'Effectif': 'Effectif',
                'Male': 'Male',
                'Female': 'Female',
                'Attachments': 'Attachments',
                'Attach a file': 'Attach a file',
                'Activity': 'Activity',
                'comment': 'comment',
                'Comment': 'Comment',
                'Download': 'Download'
            };

            $scope.submit = function() {
                $scope.publish({comment:$scope.comment});
                $scope.comment = null;
            };



            var input_file = angular.element('form[name="fileForm"] input[type="file"]');
            input_file.bind('change', function () {
                console.log(input_file.val());
                if (!input_file.get(0).files[0])
                    return;
                $scope.addfile({file: input_file.get(0).files[0]});
            });
            $scope.submitFile = function () {
                input_file.trigger('click');
            };
        },
        scope: {
            files:'=',
            comments:'=',
            olds:'=',
            files: '=',
            properties:'=',
            working:'=',
            error:'=',
            publish: '&',
            addfile: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('datepicker', [function (){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, $element, attrs, ngModelCtrl) {
            var options = {
                todayBtn: "linked",
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: true,
                autoclose: true
            };
            $element.datepicker(options);

            //when data changes outside of AngularJS notify the third party directive of the change
            ngModelCtrl.$render = function () {
                $element.val(ngModelCtrl.$viewValue);
            };

            //when data changes outside angular js
            $element.on('set', function (args){
                //tell angular js that it needs to update the ui
                $scope.$apply(function (){
                    ngModelCtrl.$setViewValue($element.val());
                });
            });
        }
    };
}]);
/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('excelColumn', ['ExcelColumnViewService', function (Column){
    return {
        restrict: 'A',

        required:'^excelView',

        scope:{
            header: '=',
            formula:'=',
            items: '='
        },

        link: function ($scope, $element, attrs, view) {
            $scope.header.index = $scope.header.index || $scope.header.name;
            var col = new Column({name:$scope.header.name, index:$scope.header.index, items:$scope.items, formula:$scope.formula, view:view});
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('excelView', ['ExcelViewService', 'ExcelColumnViewService', function(ExcelView, Column) {
    return {
        templateUrl: 'views/excel-view.html',
        restrict:'AE',
        scope: {
            headers: '=',
            viewId:'@',
            model:'='
        },

        controller: function($scope, $element, $attrs) {

            $scope.strs = {
                'Undo': 'Undo',
                'Redo': 'Redo',
                'Cut': 'Cut',
                'Copy': 'Copy',
                'Paste': 'Paste',
                'Remove row': 'Remove row',
                'Remove column': 'Remove column',
                'Insert': 'Insert',
                'Edit': 'Editx',
                'Insert graphic': 'Insert graphic',
                'Insert row': 'Insert row',
                'Insert column': 'Insert column'
            };

            $element.attr('id', $scope.viewId);
            this.view = new ExcelView({el: $element, headers:$scope.headers});
            this.state = $scope.state = this.view.state;

            console.log(this.state);
            console.log('END');
            this.view.setModel($scope.model);
        }
    };
}]);
/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('fileInput', ['ServerFileModel', function (ServerFile){
    return {
        restrict: 'AE',
        templateUrl:'views/file-input.html',
        scope:{
            paths:'='
        },

        link: function ($scope, $element, attrs) {
            $scope.strs = {
                'Upload the text file': 'Upload the text file'
            };


            $scope.loading = false;
            $scope.error = null;

            var add_file_preview = function(file_src, i) {
                if (!i) i=0;
                var newfile = $('<input class="form-control file-hide"  '+
                'name="file-'+i+'" type="hidden" />');
                var newprev = $('<i class="item-preview fa fa-file" '+
                'style="font-size:43px;"></i>');
                newfile.val(file_src);
                var span = $('<span class="item-preview"/>');
                span.append(newfile).append(newprev);
                span.append(
                    '<i class="closes fa fa-remove"/>');
                span.find('i.closes').bind('click', function (evt) {
                    var $elt = $(evt.currentTarget);
                    $elt.parent().remove();
                    console.log($scope.paths);
                    $scope.paths.splice(i, 1);
                    console.log($scope.paths);
                });
                return span;
            };

            var enable_text_file_upload_fct = function () {
                var input_file = $element.find('input[type="file"]');
                var add_file = $element.find('.add-file');

                add_file.find('[what="upload-file"]').bind('click', function(evt) {
                    evt.preventDefault();
                    console.log(input_file);
                    input_file.trigger('click');
                });

                var that = this;
                input_file.bind('change', function () {
                    console.log(input_file.val());
                    $scope.loading = true;
                    console.log($scope.loading);
                    if (!input_file.get(0).files[0]) {
                        $scope.loading = false;
                        return;
                    }

                    var file=new ServerFile({file:input_file.get(0).files[0],type:2});
                    file.psave();/*so that the file can have an id*/
                    var span = add_file_preview(null, file.id);

                    add_file.parent().append(span);
                    file.save().then(
                        function (path) {
                            console.log('path---->'+path);
                            $scope.loading = false;
                            console.log($scope.loading);
                            if (path == '0') {
                                $scope.error = 'Error while saving the file. Check that the extension and the size are correct ';
                                span.remove();
                                return;
                            }
                            span.find('.file-hide').val(path);
                            $scope.paths.push(path);
                            $scope.error = null;

                        }, function (error){
                            $scope.loading = false;
                            $scope.error = error.msg;
                    });
                });
            };

            enable_text_file_upload_fct();
        }
    };
}]);
/**
 * Created by tchapda gabi on 01/06/2015.
 */
/*Nous portons tous les masques. Et vient un temps ou on ne peut plus les enlever sans se gratter la peau*/

sukuApp.directive('fixedHeight', [function (){
    return {
        restrict: 'A',
        link: function ($scope, $element, attrs) {
            var adjust = function () {
                var w_h = $(window).height();
                var top = $element.offset().top;
                $element.height(w_h - top - 50);
            };

            adjust();
            $(window).bind('resize', adjust);

            $element.on('$destroy', function (){
                $(window).unbind('resize', adjust);
            });
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('gridView', ['Helper', function(Helper) {
    return {
        templateUrl: 'views/grid-view.html',
        restrict:'A',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Open': 'Open',
                'Edit': 'Edit',
                'Delete': 'Delete'
            };

            for(var i=0; i<$scope.headers.length; ++i) {
                if (!$scope.headers[i].name)
                    throw('name is required for each header') ;
                $scope.headers[i].index = $scope.headers[i].index || $scope.headers[i].name;
            }

            $scope.click_hdl = function(item) {
                item.selected = !item.selected;
            };

            $scope.open_hdl = function (item){
                $scope.open({item:item});
            };

            $scope.edit_hdl = function (item){
                $scope.edit({item:item});
            };

            $scope.remove_hdl = function (item){
                $scope.remove({item:item});
            };

            $scope.present = Helper.truncate;
        },
        scope: {
            icon: '=',
            headers: '=',
            items: '=',
            open:'&',
            edit:'&',
            remove:'&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('importStudentsModal', [function() {
    return {
        templateUrl: 'views/import-students-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'If your student file is not a text file (pdf, excel, word, ...)': 'If your student file is not a text file (pdf, excel, word, ...)',
                'open your text editor (notepad, bloc note, emacs ...)': 'open your text editor (notepad, bloc note, emacs ...)',
                'copy the students\' names in that file, each name on it\'s own line and save the file with the extension .txt or .text':
                    'copy the students\' names in that file, each name on it\'s own line and save the file with the extension .txt or .text',
                'Then import it via this assistant': 'Then import it via this assistant',
                'The other students\' information (email, phone ...) must be filled later':
                    'The other students\' information (email, phone ...) must be filled later',
                'The imported students will be added to students already present in the classroom before':
                    'The imported students will be added to students already present in the classroom before',
                'Close': 'Close',
                'Send': 'Send'
            };

            $scope.submit = function() {
                $scope.imports();
            };
        },
        scope: {
            working:'=',
            loading:'=',
            paths:'=',
            error:'=',
            imports: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('inviteUserModal', [function() {
    return {
        templateUrl: 'views/invite-user-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.strs = {
                'Email': 'Email',
                'Enter your colleague\'s email': 'Enter your colleague\'s email',
                'You may want to share some of your classroom with him': 'You may want to share some of your classroom with him',
                'Close': 'Close',
                'Invite': 'Invite'

            }
            $scope.submit = function() {
		        console.log($scope.email);
                $scope.invite({email:$scope.email});
            };
        },
        scope: {
            classrooms: '=',
            working:'=',
            error:'=',
            invite: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('notificationModal', ['$location', function($location) {
    return {
        templateUrl: 'views/notification-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.$watch('notifications.length', function (){
                if ($scope.notifications.length == 0) return;
                if (!$scope.newno) $scope.newno = !$scope.newno;
            });

            $scope.open = function (notif) {
                if (notif.link) {
                    $element.modal('hide');
                    $location.path(notif.link);
                }
            }

            $scope.strs = {
                'Five things you may have missed': 'Five things you may have missed'
            }
        },
        scope: {
            notifications:'=',
            newno:'=',
            olds:'='
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('profileModal', [function() {
    return {
        templateUrl: 'views/profile-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'username': 'username',
                'Edit': 'Edit',
                'Edit picture': 'Edit picture',
                'Edit password': 'Edit password',
                'Member since': 'Member since',
                'Teacher at': 'Teacher at',
                'old password': 'old password',
                'new password': 'new password',
                'new password again': 'new password again',
                'Close': 'Close',
                'Save': 'Save',
                'Edit or Profile': 'Change password'
            };

            $scope.more = false;

            $scope.toggleEdit = function () {
                $scope.more = !$scope.more;
                $scope.strs['Edit or Profile'] = ($scope.more ? 'Profile' : 'Change password');
            };

            $scope.submit = function() {
                $scope.editpwd({old:$scope.oldpwd, new1:$scope.newpwd, new2:$scope.newpwd2});
                $scope.oldpwd = $scope.newpwd = $scope.newpwd2 = '';
            };


            var input_file = angular.element('form[name="tofForm"] input[type="file"]');
            input_file.bind('change', function () {
                console.log(input_file.val());
                if (!input_file.get(0).files[0])
                    return;
                $scope.edittof({file: input_file.get(0).files[0], type:1});
            });
            $scope.submitTof = function () {
                input_file.trigger('click');
            };

        },
        scope: {
            user: '=',
            working:'=',
            error:'=',
            editpwd: '&',
            edittof: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveClassroomModal', [function() {
    return {
        templateUrl: 'views/save-classroom-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Name': 'Name',
                'School': 'School',
                'classroom name': 'classroom name',
                'school name': 'school name',
                'Close': 'Close',
                'Save': 'Save'
            };

            $scope.submit = function() {
                $scope.save();
            };
        },
        scope: {
            classroom: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveStudentModal', [function() {
    return {
        templateUrl: 'views/save-student-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
                $scope.save();
            };
        },
        scope: {
            student: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('saveTestModal', [function() {
    return {
        templateUrl: 'views/save-test-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
                $scope.save();
            };


        },
        scope: {
            test: '=',
            working:'=',
            error:'=',
            save: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('shareEltModal', [function() {
    return {
        templateUrl: 'views/share-elt-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.submit = function() {
		console.log($scope.email);
                $scope.share({email:$scope.email});
            };
        },
        scope: {
            elt: '=',
            working:'=',
            error:'=',
            share: '&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('tableView', [function() {
    return {
        templateUrl: 'views/table-view.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){
            $scope.strs = {
                'Open': 'Open',
                'Edit': 'Edit',
                'Delete': 'Delete'
            };

            for(var i=0; i<$scope.headers.length; ++i) {
                if (!$scope.headers[i].name)
                    throw('name is required for each header') ;
                $scope.headers[i].index = $scope.headers[i].index || $scope.headers[i].name;
            }

            $scope.click_hdl = function(item) {
                item.selected = !item.selected;
            };

            $scope.deselect = function () {
                for(var i=0; i<$scope.items.length; ++i) {
                    $scope.items[i].selected = false;
                    var item = $scope.items[i];
                }
            };

            $scope.open_hdl = function (item){
                console.log(item);
                $scope.open({item:item});
            };

            $scope.edit_hdl = function (item){
                $scope.edit({item:item});
            };

            $scope.remove_hdl = function (item){
                $scope.remove({item:item});
            };

            $element.bind('click', function(evt){
                if (evt.target.tagName == 'TBODY') $scope.deselect();
            });
        },
        scope: {
            icon: '=',
            headers: '=',
            items: '=',
            edit:'&',
            open:'&',
            remove:'&'
        }
    };
}]);
/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.directive('testPropertiesModal', [function() {
    return {
        templateUrl: 'views/test-properties-modal.html',
        restrict:'AE',
        link: function($scope, $element, $attrs){

            $scope.strs = {
                'Properties': 'Properties',
                'Effectif': 'Effectif',
                'Male': 'Male',
                'Female': 'Female',
                'Attachments': 'Attachments',
                'Attach a file': 'Attach a file',
                'Activity': 'Activity',
                'comment': 'comment',
                'Comment': 'Comment',
                'Download': 'Download'
            };

            $scope.submit = function() {
                $scope.publish({comment:$scope.comment});
                $scope.comment = null;
            };



            var input_file = angular.element('form[name="fileForm"] input[type="file"]');
            input_file.bind('change', function () {
                console.log(input_file.val());
                if (!input_file.get(0).files[0])
                    return;
                $scope.addfile({file: input_file.get(0).files[0]});
            });
            $scope.submitFile = function () {
                input_file.trigger('click');
            };
        },
        scope: {
            files:'=',
            comments:'=',
            olds:'=',
            files: '=',
            properties:'=',
            working:'=',
            error:'=',
            publish: '&',
            addfile: '&'
        }
    };
}]);
