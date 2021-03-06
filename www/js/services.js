angular.module('geiaFitApp')

  .service('loadingActivity', function () {
    return {
      show: function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart("Please wait...", options);
      },
      hide: function () {
        SpinnerPlugin.activityStop();
      }
    }
  })

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

      localStorage.setItem('LOCAL_TOKEN_KEY', token);
      localStorage.setItem('KEEP_SIGNED_IN', isChecked);
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
      localStorage.removeItem('LOCAL_TOKEN_KEY');
    }

    var login = function (name, pw, isChecked) {
      var form = {
        username: name,
        password: pw
      }
      form = JSON.stringify(form);
      //$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
      if (localStorage.getItem('LOCAL_TOKEN_KEY') != null) {
        logout();
      }
      var promise = $http({
        method: "POST",
        url: ApiEndpoint.url + '/user/login',
        data: form
      }).then(function (response) {
        $rootScope.cookieValue = response.data.session_name + "=" + response.data.sessid;
        var token = response.data.token
        storeUserCredentials(token, isChecked);
        $rootScope.token = token;
        $rootScope.loggedInUserUid = response.data.user.uid;
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
      var logoutToken = localStorage.getItem('LOCAL_TOKEN_KEY')
      destroyUserCredentials()
      return $http({
        headers: {
          //'X-CSRF-Token': $rootScope.token,
          'X-CSRF-Token': logoutToken,
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

    var resetPassword = function (email) {

      var params = {
        "email": email
      }
      return $http({
        method: 'POST',
        data: params,
        url: ApiEndpoint.url + "/profile/pwdreset "
      }).then(function (response) {
        return response;
      }, function (err) {
        //console.log(err);
        return err;
      });

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
      role: function () { return role; },
      forgetPassword: resetPassword
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
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: 'POST',
        url: createPatientURL,
        data: request_params
      };
      console.log(req)
      return $http(req);
    }

    var getActivity = function (uid) {
      console.log(uid)
      $rootScope.UID = uid;
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


    var setVitals = function (request_params, uid) {
      console.log(uid)

      var prom = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: 'PUT',
        url: ApiEndpoint.url + '/characteristics/' + uid,
        data: request_params
      }).then(function (response) {
        console.log(response);
      });
      return prom;
    }


    var getProfile = function (uid) {
      $rootScope.patientId = uid;
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
          // {
          //   id: 4,
          //   title: "Review Snapshots",
          //   routingStateName: "reviewSnapshots"
          // },
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
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "GET",
        url: ApiEndpoint.url + "/goals/tresholds/" + uid // Hardcoded needs to be replaced
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return promise;
    }

    var setThreshold = function (request_params, uid) {
      var promise = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "PUT",
        data: request_params,
        url: ApiEndpoint.url + "/goals/tresholds/" + uid // Hardcoded needs to be replaced
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return promise;
    }

    var getActivityGoal = function (uid) {
      console.log(uid)
      var prom = $http({
        method: "GET",
        url: ApiEndpoint.url + '/goals/activity/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }

    var setActivityGoal = function (request_params, uid) {
      var prom = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "PUT",
        data: request_params,
        url: ApiEndpoint.url + '/goals/activity/' + uid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      })
      return prom;
    }

    var onMessageHold = function (request_params, uid) {
      var promise = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "POST",
        data: request_params,
        url: ApiEndpoint.url + "/ptmessages/read/" + uid // Hardcoded needs to be replaced
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
      setActivityGoal: setActivityGoal,
      getActivityGoal: getActivityGoal,
      getHealthPoint: getHealthPoint,
      getVitals: getVitals,
      setVitals: setVitals,
      addPatient: addPatient,
      profile: getProfile,
      sortedByList: getSortedList,
      getThreshold: getThreshold,
      setThreshold: setThreshold,
      onMessageHold: onMessageHold
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
      var ProfileImage = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          //'cookie': $rootScope.cookieValue
        },
        method: "POST",
        url: ApiEndpoint.url + "/profile/profileimage/" + $rootScope.loggedInUserUid,
        data: params
      }).then(function (response) {
        console.log(response)
        return response.data;
      }, function (err) {
        console.log(err);

      });
      return ProfileImage;
    }

    var saveProfile = function (params) {
      var profileData = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          //'cookie': $rootScope.cookieValue
        },
        method: "PUT",
        data: params,
        url: ApiEndpoint.url + "/profile/" + $rootScope.loggedInUserUid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return profileData;
    }

    return {
      myAccountDetails: getAdminProfile,
      uploadImage: uploadProfileImage,
      saveProfile: saveProfile,
    }

  }])
  .service('ChatApp', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {


    var uid = $rootScope.loggedInUserUid;
    var getUserMessages = function (userId, ptid) {

      var messageData = $http({
        method: "GET",
        url: ApiEndpoint.url + "/ptmessages/" + ptid + "/" + userId + "/000000"
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return messageData;

    }


    var sendPatientMessage = function (message, userId, ptid) {
      //   alert("sendPatientMessage");

      var messageData = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "POST",
        url: ApiEndpoint.url + "/ptmessages/" + ptid + "/" + userId,

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

  .service('SetExerciseProgramService', ['$rootScope', '$http', 'ApiEndpoint', 'loadingActivity', function ($rootScope, $http, ApiEndpoint, loadingActivity) {
    console.log("SetExerciseProgramService" + $rootScope.patientId);
    var getExerciseList = function (pid) {

      var exerciseData = $http({
        method: "GET",
        url: ApiEndpoint.url + "/webex/" + pid
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return exerciseData;
    }

    var deleteExercise = function (ptId, exId) {
      var deleteExercise = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "DELETE",
        url: ApiEndpoint.url + "/webex/" + ptId + "/" + exId
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return deleteExercise;
    }


    var editExercise = function (exercise, ptId) {
      loadingActivity.show();
      var exerciseData = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "PUT",
        url: ApiEndpoint.url + "/webex/" + $rootScope.patientId,
        data: exercise,
      }).then(function (response) {
        loadingActivity.hide();
        return response.data;
      }, function (err) {
        loadingActivity.hide();
        alert("SERVICE ERROR" + JSON.stringify(err.data));
        console.log(err);
      });
      return exerciseData;
    }

    var saveExercise = function (exercise) {
      loadingActivity.show();
      var exerciseData = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "POST",
        url: ApiEndpoint.url + "/webex/" + $rootScope.patientId,
        data: exercise,
      }).then(function (response) {
        loadingActivity.hide();
        return response.data;
      }, function (err) {
        loadingActivity.hide();
        alert("SERVICE ERROR" + JSON.stringify(err.data));
        console.log(err);
      });
      return exerciseData;
    }

    return {
      listOfExercise: getExerciseList,
      saveExercise: saveExercise,
      editExercise: editExercise,
      deleteExercise: deleteExercise

    }

  }])


  .service('ExerciseProgramService', ['$rootScope', '$http', 'ApiEndpoint', function ($rootScope, $http, ApiEndpoint) {

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

    var deleteExercise = function (ptId, exId) {
      console.log(ptId + " : " + exId)
      var deleteExercise = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          'Access-Control-Allow-Origin': '*'
        },
        method: "DELETE",
        url: ApiEndpoint.url + "/ptexlib/" + ptId + "/" + exId
      }).then(function (response) {
        return response.data;
      }, function (err) {
        console.log(err);
      });
      return deleteExercise;
    }


    return {
      exerciseData: getExerciseList,
      deleteExercise: deleteExercise
    }

  }])

  .service('AddExerciseService', ['$rootScope', '$http', 'ApiEndpoint', 'loadingActivity', function ($rootScope, $http, ApiEndpoint, loadingActivity) {

    var addExercise = function (params) {
      loadingActivity.show();
      var methodType = "";
      if (params.exid == null) {
        methodType = "POST";
      } else {
        methodType = "PUT";
      }
      var exerciseData = $http({
        headers: {
          'X-CSRF-Token': $rootScope.token,
          //'cookie': $rootScope.cookieValue
        },
        method: methodType,
        data: params,
        url: ApiEndpoint.url + "/ptexlib/" + $rootScope.loggedInUserUid
      }).then(function (response) {
        loadingActivity.hide();
        return response.data;
      }, function (err) {
        loadingActivity.hide();
        console.log(err);
      });
      return exerciseData;
    }

    return {
      addExercise: addExercise
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