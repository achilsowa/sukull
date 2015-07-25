/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('NotificationCtrl', ['NotificationService', function (Notification){
    var self = this;

    self.init = function () {
        self.dialog = angular.element('#notification-modal');
        self.new_notification = false;
        self.notifications = Notification.items;
        self.olds = Notification.olds;

    };


    self.openDialog = function() {
        //if (self.new_notification) Notification.readNotifications();
        self.new_notification = false;
        self.dialog.modal();
    };

}]);
