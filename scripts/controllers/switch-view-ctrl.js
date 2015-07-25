/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('SwitchViewCtrl', [function (){
    var self = this;
    self.init = function (max){
        self.current_tab = 0;
        self.max_tab = max;
    };

    self.next = function() {
        self.current_tab = (++self.current_tab) % self.max_tab;
    };

    self.go = function (tab){
        self.current_tab = tab % self.max_tab;
    }
}]);

