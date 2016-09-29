// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('geiaFitApp', ['ionic', 'rzModule','ngCordova'])
// .constant('ApiEndpoint', {
//   url: 'http://192.168.2.196:8100/api'
// })
//For the real endpoint, we'd use this
.constant('ApiEndpoint', {
 url: 'http://app.geiafit.com/api'
})
.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    $rootScope.Regex = {
      email:/^[a-zA-Z0-9][a-zA-Z0-9_\-\+]*(?:[\.][a-zA-Z0-9_\-\+]+)*\@(?:[a-zA-Z0-9_\-\+]+\.)+[a-zA-Z0-9_\-\+]*[a-zA-Z0-9]$/,
    }
    $rootScope.flash = {
      show: false
    };

  });
})
// .run(function($httpBackend){
//   $httpBackend.whenGET('http://localhost:8100/valid')
//         .respond({message: 'This is my valid response!'});
//   $httpBackend.whenGET('http://localhost:8100/notauthenticated')
//         .respond(401, {message: "Not Authenticated"});
//   $httpBackend.whenGET('http://localhost:8100/notauthorized')
//         .respond(403, {message: "Not Authorized"});
 
//   $httpBackend.whenGET(/templates\/\w+.*/).passThrough();
 
//  })
.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, USER_ROLES) {
  $ionicConfigProvider.views.maxCache(0);
  // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  var patientParams = {
      name: null,
      age: null,
      gender: null,
      email: null,
      profile_url: null,
      low: null,
      medium: null,
      high: null
    };

  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.htm',
    controller: 'LoginCtrl'
  })
  .state('main', {
    url: '/',
    abstract: true,
    templateUrl: 'templates/main.htm',
    controller: "AppCtrl",
    resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  .state('main.dash', {
    url: 'dashboard',
    templateUrl: 'templates/dashboard.htm',
    controller: 'DashboardCtrl',
    resolve: {
      patientsData:function(AppService){
        return AppService.patientsData();
      }
    }
  })
  .state('main.exerciseLibrary', {
    url: 'exerciseLibrary',
    templateUrl: "templates/exerciseLibrary.htm",
    controller: "ExerciseLibraryCtrl"
  })
  .state('addExercise', {
    url: 'addExercise', 
    templateUrl: "templates/addExercise.htm",
    controller: "AddExerciseCtrl"
  })
  //new
  
    .state('setExerciseProgram', {
    url: '/setExerciseProgram',
    params: patientParams,
    templateUrl: 'templates/setExerciseProgram.htm',
    controller: 'SetExerciseProgramCtrl',
    resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })



 .state('AddExcercisePopup', {
    url: 'AddExcercisePopup', 
    templateUrl: 'templates/AddExercisePopup.htm',
    controller: 'AddExercisePopupCtrl'
  })
  //
  
  .state('vitalSuccess',{
url:"/vitalSuccess",
templateUrl:'templates/vitalSuccess.htm'
})

  
/*  
  .state('setExerciseProgram', {
    url: '/setExerciseProgram',
    params: patientParams,
    templateUrl: 'templates/setExerciseProgram.htm',
    controller: 'SetExerciseProgramCtrl',
    resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })*/
  .state('setActivityGoals', {
    url: '/setActivityGoals',
    params: {
      name: null
    },
    templateUrl: 'templates/setActivityGoals.htm',
    controller: 'SetActivityGoalsCtrl',
    resolve: {
      sortedByList: function(AppService, $stateParams){
        return AppService.sortedByList();
      },
      threshold: function(AppService){
        return AppService.getThreshold().then(function(data){
          return data.data;
        });
      }
    }
  })
  .state('activity', {
    url: '/activity', 
    params: patientParams,
    templateUrl: 'templates/activity.htm',
    controller: 'ActivityCtrl',
     resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  
  .state('exerciseProgram', {
    url: '/exerciseProgram', 
    params: patientParams,
    templateUrl: 'templates/exerciseProgram.htm',
    controller: 'ExerciseProgramCtrl',
     resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  .state('addSnapshot',{
url:'/addSnap',
templateUrl:'templates/addSnapshot.htm'

  })


  .state('activityLog', {
    url: '/activityLog', 
    template: '<h1 class="comingSoon">Coming soon</h1>'
  })
  
  
  
 /* .state('exerciseProgram', {
    url: '/exerciseProgram', 
	  templateUrl: 'templates/exerciseProgram.htm' 
   // template: '<h1 class="comingSoon">Coming soon</h1>'
  })*/
  
   .state('reviewSnapshots', {
    url: '/reviewSnapshots', 
    templateUrl: 'templates/reviewSnapshots.htm',
    controller: 'ReviewSnapshotsCtrl',
    resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  
 /* .state('reviewSnapshots', {
    url: '/reviewSnapshots', 
    templateUrl: 'templates/reviewSnapshots.htm',
    controller: 'ReviewSnapshotsCtrl'
  })*/
  .state('messages', {
    url: '/messages', 
    template: '<h1 class="comingSoon">Coming soon</h1>'
  })
  
   .state('vitals', {
    url: '/vitals', 
      templateUrl: 'templates/vitals.htm',
      controller:'VitalsCtrl',
       resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  
 /* 
  .state('vitals', {
    url: '/vitals', 
    template: '<h1 class="comingSoon">Coming soon</h1>'
  })*/
/*  .state('payments', {
    url: '/payments', 
	   templateUrl: 'templates/payment.htm'
   // template: '<h1 class="comingSoon">Coming soon</h1>'
  })*/
  .state('payments', {
    url: '/payments', 
    params: patientParams,
    templateUrl: 'templates/payment.htm',
    controller: 'paymentCtrl',
     resolve: {
      sortedByList: function(AppService){
        return AppService.sortedByList();
      }
    }
  })
  
  
  
  .state('addPatient', {
    url: '/addPatient', 
    templateUrl: 'templates/addPatient.htm',
    controller: 'AddPatientCtrl'
  })
  .state('myAccount', {
    url: 'myAccount', 
    templateUrl: "templates/myAccount.htm",
    controller: "MyAccountCtrl",
    resolve: {
      profile: ['$stateParams', 'AppService', function($stateParams, AppService){
        return AppService.profile();
      }]
    }
  });
  // .state('main.admin', {
  //   url: 'main/admin',
  //   views: {
  //       'admin-tab': {
  //         templateUrl: 'templates/admin.htm'
  //       }
  //   },
  //   data: {
  //     authorizedRoles: [USER_ROLES.admin]
  //   }
  // });
  
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("main.dash");
  });
})
.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
 
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
})
// .config(function($stateProvider, $urlRouterProvider){
//     $stateProvider
//     .state('app', {
//       url: "/app",
//       abstract: true,
//       templateUrl: "templates/menu.htm", 
//       controller: "AppCtrl"
//     })
//     .state('app.login', {
//       url: "/login", 
//       views: {
//         'menucontent': {
//           templateUrl: "templates/login.htm", 
//           controller: "LoginCtrl"
//         }
//       }, 
//       hideMenuIcon: true
//     })
//     .state('app.dashboard', {
//       url: "/dashboard", 
//       views: {
//         'menucontent': {
//           templateUrl: "templates/dashboard.htm", 
//           controller: "DashboardCtrl"
//         }
//       }
//     })
//     $urlRouterProvider.otherwise('/app/login');
// });

