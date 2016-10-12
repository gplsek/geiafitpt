angular.module('geiaFitApp')

  .service('AuthService', ['$q', '$http', 'USER_ROLES', 'ApiEndpoint', 'Flash', '$rootScope', function ($q, $http, USER_ROLES, ApiEndpoint, Flash, $rootScope) {
    console.log('ApiEndpoint', ApiEndpoint)
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var username = '';
    var isAuthenticated = true;
    var role = '';
    var authToken;

    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        console.log("token:");
        console.log(token);
        useCredentials(token);
      }
      else {
        console.log("Not loading token key");
      }
    }

    function storeUserCredentials(token, isChecked) {

      // window.localStorage.setItem('LOCAL_TOKEN_KEY', token);
      // window.localStorage.setItem('KEEP_SIGNED_IN', isChecked);
      useCredentials(token);
    }

    function useCredentials(token) {
      console.log("useCredentials called");

      username = token.split('.')[0];
      console.log(username)
      console.log("---end");
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

    var login = function (name, pw, isChecked) {
      var form = {
        username: name,
        password: pw
      }
      form = JSON.stringify(form);
      //$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
      var promise = $http({
        method: "POST",
        url: ApiEndpoint.url + '/user/login',
        data: form
      }).then(function (response) {
        console.log("Store Use Credentials called");
        storeUserCredentials(name + response.data.token, isChecked);
        console.log(response);
        var token = response.data.token
        console.log(token);
        $rootScope.token = token;
        $rootScope.loggedInUserUid = response.data.user.uid;
        console.log("UID " + $rootScope.loggedInUserUid);
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

    var logout = function () {
      destroyUserCredentials();
      return $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: 'POST',
        url: ApiEndpoint.url + "/user/logout"
      }).then(function (response) {
        console.log(response);
        $rootScope.token = null;
        return response;
      });
    };

    var isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };

    console.log("---loadUserCredentials");
    loadUserCredentials();
    console.log("--- end loadUserCredentials");
    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function () { return isAuthenticated; },
      username: function () { return username; },
      role: function () { return role; }
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
  .service('AppService', ['$http', 'AuthService', '$q', 'ApiEndpoint', '$rootScope', function ($http, AuthService, $q, ApiEndpoint, $rootScope) {


    var getPatientsData = function () {
      console.log("uid " + $rootScope.loggedInUserUid)
      var uid = $rootScope.loggedInUserUid;
      return $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: 'POST',
        url: ApiEndpoint.url + "/profile/mypatients/" + uid
      }).then(function (response) {
        console.log(response);
        return response.data.patients;
      });
    }

    var addPatient = function (request_params) {
      console.log("uid " + $rootScope.loggedInUserUid)
      var uid = $rootScope.loggedInUserUid;
      var createPatientURL = ApiEndpoint.url + "/profile/createpatient/" + uid
      var req = {
        method: 'POST',
        url: createPatientURL,
        data: request_params
      };
      console.log(req)
      return $http(req);
    }

    var getActivity = function (uid) {
      console.log(uid)
      var prom = $http({
        method: "GET",
        url: ApiEndpoint.url + '/log/activity/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }

    var getHealthPoint = function (uid) {
      console.log(uid)
      var prom = $http({
        method: "GET",
        url: ApiEndpoint.url + '/log/health_points/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }

    var getVitals = function (uid) {
      console.log(uid)
      var prom = $http({
        method: "GET",
        url: ApiEndpoint.url + '/characteristics/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }


    var getProfile = function (uid) {
      var prom = $http({
        method: "GET",
        url: ApiEndpoint.url + '/profile/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }

    var getSortedList = function () {
      return $q(function (resolve, reject) {
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
      }).then(function (response) {
        console.log(response);
        return response;
      });
    }

    var getThreshold = function (uid) {
      var promise = $http({
        method: "GET",
        url: ApiEndpoint.url + "/goals/tresholds/37" // Hardcoded needs to be replaced
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return promise;
    }


    return {
      patientsData: getPatientsData,
      getActivity: getActivity,
      getHealthPoint : getHealthPoint,
      getVitals: getVitals,
      addPatient: addPatient,
      profile: getProfile,
      sortedByList: getSortedList,
      getThreshold: getThreshold
    }

  }])


  .service('MyAccount', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {

    var getAdminProfile = function () {

      var profileData = $http({
        method: "GET",
        url: ApiEndpoint.url + "/profile/" + $rootScope.loggedInUserUid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return profileData;

    }

    var uploadProfileImage = function (params) {
      console.log(params)
      var ProfileImage = $http({
        method: "POST",
        url: ApiEndpoint.url + "/profile/profileimage/" + $rootScope.loggedInUserUid,
        data: params
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);

      });
      return ProfileImage;
    }

    return {
      myAccountDetails: getAdminProfile,
      uploadImage: uploadProfileImage
    }

  }])
  .service('ChatApp', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {


 var uid = $rootScope.loggedInUserUid;
   var getUserMessages = function(userId,ptid){

      var messageData = $http({
        method: "GET", 
        url: ApiEndpoint.url +"/ptmessages/"+ptid+"/"+userId+"/000000"
      }).then(function(response){
         return response.data;
      }, function(err){
          console.log(err);
      });
      return messageData;

    }


   var sendPatientMessage = function(message,userId,ptid){
  //   alert("sendPatientMessage");

    var messageData = $http({
      headers: {
                'X-CSRF-Token': $rootScope.token,
                'Access-Control-Allow-Origin': '*'
              },
        method: "POST", 
        url: ApiEndpoint.url + "/ptmessages/"+ptid+"/"+userId,

        data: message,
      }).then(function (response) {
       // alert("SERVICE SUCCESS" + JSON.stringify(response.data));
        return response.data;
      }, function (err) {
        alert("SERVICE ERROR" + JSON.stringify(err.data));
        console.log(err);
      });
      return messageData;

    }

    return {
      getUserMessages: getUserMessages,
      sendPatientMessage: sendPatientMessage

    }

  }])

.service('SetExerciseProgramService', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {

    var getExerciseList = function (pid) {

      var exerciseData = $http({
        method: "GET",
        url: "https://api.geiafit.com/api/webex/"+pid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return exerciseData;
    }

    var saveExercise = function(exercise,ptId)
    {
       var exerciseData = $http({
      headers: {
                'X-CSRF-Token': $rootScope.token,
                'Access-Control-Allow-Origin': '*'
              },
        method: "PUT", 
        url: ApiEndpoint.url + "/webex/"+ptId,
    data: exercise,
      }).then(function (response) {
      //  alert("SERVICE SUCCESS" + JSON.stringify(response.data));
        return response.data;
      }, function (err) {
        alert("SERVICE ERROR" + JSON.stringify(err.data));
        console.log(err);
      });
      return exerciseData;
    }

    return {
      listOfExercise: getExerciseList
    }

  }])


  .service('ExerciseLibraryService', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {

    var getExerciseList = function () {

      var exerciseData = $http({
        method: "GET",
        url: ApiEndpoint.url + "/ptexlib/" + $rootScope.loggedInUserUid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return exerciseData;
    }

    return {
      exerciseData: getExerciseList
    }

  }])

  .service('Flash', ['$timeout', '$rootScope', function ($timeout, $rootScope) {

    var showFlash = function (obj) {
      $rootScope.flash.type = obj.type;
      $rootScope.flash.message = obj.message;
      $rootScope.flash.show = true;

      $timeout(function () {
        $rootScope.flash.show = false;
      }, 3000);
    }

    return {
      showFlash: showFlash
    }
  }]);