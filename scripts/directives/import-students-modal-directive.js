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
