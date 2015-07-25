/**
 * Created by tchapda gabi on 27/05/2015.
 */

var sukuApp = angular.module('sukuApp', ['ngRoute']);
sukuApp.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider.when('/', {
        templateUrl: 'views/classrooms.html',
        controller: 'SKClassroomsCtrl as classroomsCtrl',
        resolve:{
            load_models: ['ModelLoaderService', 'AuthLoaderService', 'trFilter', function (ModelLoader, AuthLoader, tr){
                AuthLoader.page.title = tr('Classrooms');
                return ModelLoader.loadClassrooms();
            }]
        }
     }).when('/classrooms', {
        templateUrl: 'views/classrooms.html',
        controller: 'SKClassroomsCtrl as classroomsCtrl',
        resolve:{
            load_models: ['ModelLoaderService', 'AuthLoaderService', 'trFilter', function (ModelLoader, AuthLoader, tr){
                AuthLoader.page.title = tr('Classrooms');
                return ModelLoader.loadClassrooms();
            }]
        }
    }).when('/classrooms/:id', {
        templateUrl: 'views/classroom.html',
        controller: 'SKClassroomCtrl as classroomCtrl',
        resolve:{
            load_models: ['$location', 'ModelLoaderService', 'AuthLoaderService', 'ClassroomModel', 'trFilter', function ($location, ModelLoader, AuthLoader, Classrooms, tr){
                var id = $location.path().split('/')[2];
                return ModelLoader.loadClassroom(id).then(function() {
                    var classroom = Classrooms.find_by_sid(id);
                    AuthLoader.page.title = tr('Classrooms') + ' : '+ classroom.name;
                    if (classroom.school) AuthLoader.page.title += ', ' + classroom.school;
                });
            }]
        }
    }).when('/tests', {
        templateUrl: 'views/tests.html',
        controller: 'SKTestsCtrl as testsCtrl',
        resolve:{
            load_models: ['ModelLoaderService', 'AuthLoaderService', 'trFilter', function (ModelLoader, AuthLoader, tr){
                AuthLoader.page.title = tr('Tests');
                return ModelLoader.loadTests();
            }]
        }
    }).when('/tests/:id', {
        templateUrl: 'views/test.html',
        controller: 'SKTestCtrl as testCtrl',
        resolve:{
            load_models: ['$location', 'ModelLoaderService', 'AuthLoaderService', 'TestModel', 'trFilter', function ($location, ModelLoader, AuthLoader, Tests, tr){
                var id = $location.path().split('/')[2];
                return ModelLoader.loadTest(id).then(function () {
                    var test = Tests.find_by_sid(id);
                    AuthLoader.page.title = tr('Tests') + ' : ' + test.code + ', ' + test.classroom.name;
                });
            }]
        }
    }).when('/login', {
        templateUrl:'views/login.html'
    });
    $routeProvider.otherwise({
        redirectTo:'/'
    });
}]);
