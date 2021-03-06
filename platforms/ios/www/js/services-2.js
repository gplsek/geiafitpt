angular.module('geiaFitApp')
 
.service('AuthService', ['$q', '$http', 'USER_ROLES', 'ApiEndpoint', 'Flash', function($q, $http, USER_ROLES, ApiEndpoint, Flash) {
   console.log('ApiEndpoint', ApiEndpoint)
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var authToken;
 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }
 
  function storeUserCredentials(token, isChecked) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem('KEEP_SIGNED_IN', isChecked);
    useCredentials(token);
  }
 
  function useCredentials(token) {
    username = token.split('.')[0];
    isAuthenticated = true;
    authToken = token;
 
    if (username == 'admin') {
      role = USER_ROLES.admin
    }
    if (username == 'user') {
      role = USER_ROLES.public
    }
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['X-Auth-Token'] = token;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }
 
  var login = function(name, pw, isChecked) {
  
    var form = {
      username: name,
      password: pw
    }

    form = JSON.stringify(form);

//$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	  
    var promise = $http({
      method: "POST", 
      url: ApiEndpoint.url + '/user/login',
      // headers: {
      //   'Content-Type': 'application/x-www-form-urlencoded;',
      //   'Authorization' : 'Basic'+ encodeURIComponent(name + ':' + pw),
      //   'username':name,
      //   'password':pw,
      //   'Access-Control-Allow-Origin': '*'},
      data: form
    }).then(function(response){
       storeUserCredentials(name + response.data.token, isChecked);
       console.log(response);
      
    });

    return promise;
/*
     return $q(function(resolve, reject) {
       if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
         // Make a request and receive your auth token from your server
         storeUserCredentials(name + '.myToken', isChecked);
         resolve('Login success.');
       } else {
         reject('Login Failed.');
       }
     });*/
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };
 
  loadUserCredentials();
 
  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;}
  };
}])
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
.service('AppService', ['$http', 'AuthService', '$q', 'ApiEndpoint', function ($http, AuthService, $q, ApiEndpoint) {


  var getPatientsData = function(){
    return $http({
              method: 'POST',
              url: ApiEndpoint.url + "/profile/mypatients/1"
            }).then(function(response){
                console.log(response);
                return response.data.patients;
           });
  }              
   
  var getProfile = function(){
    var promise = $http({
      method: "GET",
      url: ApiEndpoint.url + '/profile/1'
    }).then(function(response){
        return response.data;
    }, function(err){
      console.log(err);
    })
    return promise;
  }

  var getSortedList = function(){
    return $q(function(resolve, reject){
        resolve([
          {
            id: 0,
            title: "Activity",
            routingStateName: "activity"  
          },
          {
            id: 1, 
            title: "Set Activity Goals",
            routingStateName: "setActivityGoals" 
          },
          {
            id: 2, 
            title: "Exercise Program",
            routingStateName: "exerciseProgram" 
          },
          {
            id: 3, 
            title: "Add Custom Exercise",
            routingStateName: "setExerciseProgram" 
          },
          {
            id: 4, 
            title: "Review Snapshots",
            routingStateName: "reviewSnapshots" 
          },
          {
            id: 5, 
            title: "Vitals",
            routingStateName: "vitals" 
          },
          {
            id: 6, 
            title: "Messages",
            routingStateName: "messages" 
          }

        ]);
    }).then(function(response){
        console.log(response);
        return response;
    });
  }

  var getThreshold = function(uid){
      var promise = $http({
        method: "GET", 
        url: ApiEndpoint.url + "/goals/tresholds/37" // Hardcoded needs to be replaced
      }).then(function(response){
         return response.data;
      }, function(err){
          console.log(err);
      });
      return promise;
  }
 

  return {
    patientsData: getPatientsData,
    profile: getProfile,
    sortedByList: getSortedList,
    getThreshold: getThreshold
  }

}])
.service('Flash', ['$timeout', '$rootScope', function($timeout, $rootScope){

  var showFlash = function(obj){
    $rootScope.flash.type = obj.type;
    $rootScope.flash.message = obj.message;
    $rootScope.flash.show = true;
    
    $timeout(function(){
      $rootScope.flash.show = false;
    }, 3000);
  }

  return {
    showFlash: showFlash
  }
}]);