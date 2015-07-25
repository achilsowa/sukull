/**
 * Created by tchapda gabi on 28/05/2015.
 */

sukuApp.controller('MainCtrl', ['AuthLoaderService', 'ClassroomModel', 'TestModel', 'ServerFileModel', '$controller', function (AuthLoader, Classrooms, Tests, ServerFile, $controller) {
    var self = this;
    self.classrooms = Classrooms.records;
    self.strs = {
        'Classrooms' : 'Classrooms',
        'Tests' : 'Tests',
        'Colleagues' : 'Colleagues',
        'Invite a colleague on sukull' : 'Invite a colleague on sukull',
        'All tests' : 'All tests',
        'All classrooms' : 'All classrooms',

        'Profile': 'Profile',
        'Settings': 'Settings',
        'Logout': 'Logout',

        'Uploading file': 'Uploading file',

        'Error' : 'Error',
        'Unable to reach the server' : 'Unable to reach the server',
        'All the changes made now may not be saved on the server': 'All the changes made now may not be saved on the server'
    };


    self.tests = Tests.records;
    self.user = AuthLoader.user;
    self.page = AuthLoader.page;
    self.loading = false;

    self.disconnect = function (){
	    console.log('disconnect');
	    AuthLoader.disconnect;
	    $.ajax({
	        type:'get',
	        url: '../server/logout',
	        async:false
	    });
    };

    var initNotificationCtrl = function () {
        self.notificationCtrl = $controller('NotificationCtrl');
        self.new_notification = self.notificationCtrl.new_notification;
        self.showNotifications = function () {
            self.notificationCtrl.openDialog();
        }

        self.notificationCtrl.init();
    };

    var initInviteUserCtrl = function () {
        self.inviteUserCtrl = $controller('InviteUserCtrl');

        self.invite = function () {
            self.inviteUserCtrl.openDialog();
        }

        self.inviteUserCtrl.init(Classrooms.records);
    };

    var initProfileCtrl = function () {
        self.profileCtrl = $controller('ProfileCtrl');

        self.profile = function () {
            self.profileCtrl.openDialog();
        }

        self.profileCtrl.init(AuthLoader.user);
    };

    var initServerFileCtrl = function () {

        self.serverFileCtrl = ServerFile.status;
        console.log(self.serverFileCtrl);
    };

    initNotificationCtrl();
    initInviteUserCtrl();
    initProfileCtrl();
    initServerFileCtrl();
}]);

