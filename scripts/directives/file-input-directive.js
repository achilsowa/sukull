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
