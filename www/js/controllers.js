angular.module('geiaFitApp')

  .controller('AppCtrl', ['$scope', '$state', '$ionicPopup', 'AuthService', 'AUTH_EVENTS', 'Flash', '$ionicHistory', function ($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, Flash, $ionicHistory) {
    $scope.username = AuthService.username();

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      });
    });


    $scope.logout = function () {
      AuthService.logout().then(function () {
        Flash.showFlash({ type: 'Logged out successfully', message: "Logged out successfully !" });
        $state.transitionTo('login', {}, { reload: true });
      }, function (err) {
        Flash.showFlash({ type: 'error', message: "Logout Failed !" });
      });
    };



    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
      //AuthService.logout();
      $state.go('login');
      var alertPopup = $ionicPopup.alert({
        title: 'Session Lost!',
        template: 'Sorry, You have to login again.'
      });
    });

    $scope.setCurrentUsername = function (name) {
      $scope.username = name;
    };

    $scope.gotoHome = function () {
      $state.transitionTo('main.dash', {}, { reload: false });
    }
    $scope.back = function () {
      console.log($ionicHistory.viewHistory());
      $ionicHistory.goBack();
    }
    //abhishek

    $scope.adds = function () {
      $state.go('addSnapshot');

    }




  }])

  .controller('LoginCtrl', ['$scope', '$state', '$ionicPopup', 'AuthService', 'Flash', '$rootScope', function ($scope, $state, $ionicPopup, AuthService, Flash, $rootScope) {

    $scope.data = {

      email: "",
      password: ""
    };

    function validateFields(data) {
      if (data.email == "" && data.password == "") {
        Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        return false;
      }
      if (data.email == "") {
        Flash.showFlash({ type: 'error', message: "Please enter email address." });
        return false;
      }
      if (data.password == "") {
        Flash.showFlash({ type: 'error', message: "Please enter your password." });
        return false;
      }
      if (!checkEmail(data.email)) {
        Flash.showFlash({ type: 'error', message: "Email is not valid !" });
        return false
      }
      return true;
    }

    function checkEmail(email) {
      console.log(email);
      var result = false;
      var pattern = $rootScope.Regex.email;
      result = pattern.test(email);
      return result;
    }


    $scope.resetPassword = function () {
      if ($scope.data.email == "") {
        Flash.showFlash({ type: 'error', message: "Please enter email address." });
      } else
        if (!(checkEmail($scope.data.email))) {
          Flash.showFlash({ type: 'error', message: "Email is not valid !" });
        } else {

          AuthService.forgetPassword($scope.data.email)
            .then(function (res) {
              if (res.data == null) {
                $ionicPopup.alert({
                  title: 'Password reset',
                  template: 'Unable to connect to server.'
                });
              }
              if (res.data.success == 0) {
                $ionicPopup.alert({
                  title: 'Password reset',
                  template: res.data.message
                });
              }
              if (res.data.Status == 1) {
                $ionicPopup.alert({
                  title: 'Password reset',
                  template: 'Please check your email for your password.'
                });
                $scope.data.email = "";
              }
              console.log(res)
            }, function (error) {
              console.log(err);
              $ionicPopup.alert({
                title: 'Password reset',
                template: 'Unable to connect to server.'
              });
            })

        }
    }


    $scope.login = function () {

      if (validateFields($scope.data)) {
        AuthService.login($scope.data.email, $scope.data.password, $scope.data.checked).
          then(function (authenticated) {
            $rootScope.currentPassword = $scope.data.password;
            Flash.showFlash({ type: 'success', message: "Success !" });
            $state.go('main.dash', {}, { reload: true });
            //$scope.setCurrentUsername(data.username);
          }, function (err) {
            Flash.showFlash({ type: 'error', message: "Login Failed !" });
          })
      }

    }


  }])
  .controller('DashboardCtrl', function ($scope, $state, $http, $ionicPopup, AuthService, patientsData) {
    // var keepsignedin = window.localstorage ? window.localstorage.getItem('KEEP_SIGNED_IN'): "";
    //  if(keepsignedin){
    //    $state.go('main.dash');
    //  }
    $scope.title = 'Name';
    $scope.subNavList = false;
    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }

    $scope.sortType = 'fname'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.searchName = '';     // set the default search/filter term
    $scope.sortOrder = false;

    $scope.isActiveToday = function (date) {

      var inputDate = new Date(date);
      var todaysDate = new Date();

      if (inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
        return true;
      }
    }

    $scope.sortedByList = [
      {
        id: 0,
        title: 'Name'
      },
      {
        id: 1,
        title: 'Emotion Level'
      },
      {
        id: 2,
        title: 'New Messages'
      },
      {
        id: 3,
        title: 'New Activity'
      }
    ];

    $scope.sortedBy = $scope.sortedByList[0].id;

    // for loop to add activity field for sorting list as per activity
    for (i in patientsData) {
      patientsData[i]['activity'] = ($scope.isActiveToday(patientsData[i].vitals_entered) || patientsData[i].unread_messages > 0)
    }
    $scope.patientList = patientsData;



    //logout
    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    $scope.gotoAction = function (id) {
      var state = getStateTitle(id);
      $state.transitionTo(state, {}, { reload: true });
    }

    $scope.sortPatients = function (sortType) {
      switch (sortType) {
        case 0:
          $scope.sortType = 'fname';
          $scope.sortOrder = false;
          $scope.title = 'Name'
          break;
        case 1:
          $scope.sortType = 'emotion';
          $scope.sortOrder = true;
          $scope.title = 'Emotion Level'
          break;
        case 2:
          $scope.title = 'New Messages',
            $scope.sortType = 'unread_messages';
          $scope.sortOrder = true;
          break;
        case 3:
          $scope.title = 'New Activity'
          $scope.sortType = 'activity';
          $scope.sortOrder = true;
          break;
        default:
          $scope.sortType = 'unread_messages';
          $scope.sortOrder = true;
          break;
      }
      $scope.subNavList = false;
    }

  })


  .controller('SetExerciseProgramCtrl', ['$scope', '$state', '$stateParams', 'sortedByList', 'SetExerciseProgramService', '$rootScope', '$cordovaCapture', '$q', 'Flash', '$ionicPopup','$cordovaCamera', function ($scope, $state, $stateParams,
    sortedByList, SetExerciseProgramService, $rootScope, $cordovaCapture, $q, Flash, $ionicPopup,$cordovaCamera) {

    var success = true;
    console.log("StateParam" + JSON.stringify($stateParams));

    $scope.uid = $stateParams.uid;
    $scope.patientData = $rootScope.patientName;
    $scope.sortedByList = sortedByList;
    $scope.title = 'Add Custom Exercise';
    $scope.subNavList = false;

    //This method for sub navigation.
    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }


    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    //This method is to change state as per title.
    $scope.gotoAction = function (id) {
      if (id == 3) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }
    }

    //This method for close the exercise view and goto exercise program. 
    $scope.closePatient = function () {
      $state.go('exerciseProgram');
    }



    //<!-----------------This is to intialize drop downs.------------------------------------------!>
    var repsList = [];

    (function steps() {
      var value = 0;
      for (var i = 1; i <= 180; i++) {
        repsList[i] = i;
        //  value += 500;
      }
      console.log(repsList);
    })();

    $scope.stepsList = repsList;
    //   $scope.selectedReps = parseInt($scope.exerciseprogram.reps);

    var repsSet = [];

    (function steps() {
      var value = 0;
      for (var i = 1; i <= 180; i++) {
        repsSet[i] = i;

      }
      console.log(repsSet);
    })();

    $scope.repsSet = repsSet;
    // $scope.selectedSet = parseInt($scope.exerciseprogram.sets);

    var repsDaily = [];

    (function steps() {
      var value = 0;
      for (var i = 1; i <= 180; i++) {
        repsDaily[i] = i;
      }
      console.log(repsDaily);
    })();

    $scope.repsDaily = repsDaily;

    // $scope.selectedDaily = parseInt($scope.exerciseprogram.daily);

    // //<!-----------------------------------------------------------!> 

    $scope.gotoExerciseProgram = function () {
      $state.transitionTo('exerciseProgram', {
        uid: $rootScope.patientId,
        name: '',
        age: '',
        gender: '',
        email: '',
        profile_url: '',
        low: '',
        medium: '',
        high: ''
      }, { reload: false });
    }

    if ($stateParams.peid === 0) {
      //  alert("inside if");
      $scope.submit = false;
      $scope.edit = true;

      $scope.exerciseprogram =
        {
          title: '',
          comments: '',
          reps: 1,
          sets: 1,
          daily: 1,
          weekly: {
            sun: 0,
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
          },
          mp4: $stateParams.mp4,
          webm: $stateParams.webm,
          mov: $stateParams.mov,
          thumb1: $stateParams.thumb1,
          thumb2: $stateParams.thumb2
        };

      $scope.selectedReps = $scope.stepsList[1];
      $scope.selectedSet = $scope.repsSet[1];
      $scope.selectedDaily = $scope.repsDaily[1];

      $scope.saveExercise = function () {


        var exercise = {
          "name": $scope.exerciseprogram.title,
          "video_data": $scope.exerciseprogram.videodata,
          "video_name": $scope.exerciseprogram.videoname,
          "video_image_name": "george.jpg",
          "video_image": "AAAAFGZ0eXBxdCAgAAAAAHF0ICAAAAAId2lkZQASLJ1tZGF0AMxABwDom+7Mmy5PA4TVKBYzFJXz.....",
          "reps": "" + $scope.exerciseprogram.reps,
          "sets": "" + $scope.exerciseprogram.sets,
          "rest": "75",
          "daily": "" + $scope.exerciseprogram.daily,
          "week_days": [
            {
              "day": "0",
              "on": $scope.exerciseprogram.weekly.sun
            },
            {
              "day": "1",
              "on": $scope.exerciseprogram.weekly.mon
            },
            {
              "day": "2",
              "on": $scope.exerciseprogram.weekly.tue
            },
            {
              "day": "3",
              "on": $scope.exerciseprogram.weekly.wed
            },
            {
              "day": "4",
              "on": $scope.exerciseprogram.weekly.thu
            },
            {
              "day": "5",
              "on": $scope.exerciseprogram.weekly.fri
            },
            {
              "day": "6",
              "on": $scope.exerciseprogram.weekly.sat
            }

          ],
          "comments": $scope.exerciseprogram.comments
        };
        SetExerciseProgramService.saveExercise(exercise).then(function (success) {
          Flash.showFlash({ type: 'success', message: "Success !" });

        }, function (error) {
          Flash.showFlash({ type: 'error', message: "Failed !" });
        })

      }

    }
    else {

      $scope.submit = true;
      $scope.edit = false;

      $scope.exerciseprogram =
        {
          peid: $stateParams.peid,
          title: $stateParams.title,
          comments: $stateParams.comments,
          code: $stateParams.code,
          reps: $stateParams.reps,
          sets: $stateParams.sets,
          rest: $stateParams.rest,
          daily: $stateParams.daily,
          today: $stateParams.today,
          alldays: $stateParams.alldays,
          weekly: {
            sun: $stateParams.weekly.sun,
            mon: $stateParams.weekly.mon,
            tue: $stateParams.weekly.tue,
            wed: $stateParams.weekly.wed,
            thu: $stateParams.weekly.thu,
            fri: $stateParams.weekly.fri,
            sat: $stateParams.weekly.sat,
          },
          mp4: $stateParams.mp4,
          webm: $stateParams.webm,
          mov: $stateParams.mov,
          thumb1: $stateParams.thumb1,
          thumb2: $stateParams.thumb2
        };

      $scope.selectedReps = parseInt($scope.exerciseprogram.reps);
      $scope.selectedSet = parseInt($scope.exerciseprogram.sets);
      $scope.selectedDaily = parseInt($scope.exerciseprogram.daily);


      $scope.editExercise = function () {
        $scope.submit = false;
        $scope.edit = true;
        $state.transitionTo('setExerciseProgram',
          {
            peid: $scope.exerciseprogram.peid,
            title: $scope.exerciseprogram.title,
            comments: $scope.exerciseprogram.comments,
            code: $scope.exerciseprogram.code,
            reps: $scope.exerciseprogram.reps,
            sets: $scope.exerciseprogram.sets,
            rest: $scope.exerciseprogram.rest,
            daily: $scope.exerciseprogram.daily,
            today: $scope.exerciseprogram.today,
            alldays: $scope.exerciseprogram.alldays,
            weekly: {
              sun: $scope.exerciseprogram.weekly.sun,
              mon: $scope.exerciseprogram.weekly.mon,
              tue: $scope.exerciseprogram.weekly.tue,
              wed: $scope.exerciseprogram.weekly.wed,
              thu: $scope.exerciseprogram.weekly.thu,
              fri: $scope.exerciseprogram.weekly.fri,
              sat: $scope.exerciseprogram.weekly.sat,
            },
            mp4: $scope.exerciseprogram.mp4,
            webm: $scope.exerciseprogram.webm,
            mov: $scope.exerciseprogram.mov,
            thumb1: $scope.exerciseprogram.thumb1,
            thumb2: $scope.exerciseprogram.thumb2
          }, { reload: false });

      };


      $scope.deleteExercise = function () {

        SetExerciseProgramService.deleteExercise($rootScope.loggedInUserUid, $scope.exerciseprogram.peid).then(function (success) {
          Flash.showFlash({ type: 'success', message: "Success !" });
        }, function (error) {
          Flash.showFlash({ type: 'error', message: "Failed !" });
        })

      };


      $scope.saveExercise = function () {
        // alert("ex" + $scope.selectedReps);
        var exercise = {
          "peid": $scope.exerciseprogram.peid,
          "title": $scope.exerciseprogram.title,
          "comments": $scope.exerciseprogram.comments,
          "reps": "" + $scope.exerciseprogram.reps,
          "sets": "" + $scope.exerciseprogram.sets,
          "daily": "" + $scope.exerciseprogram.daily,
          "week_days": [
            {
              "day": "0",
              "on": $scope.exerciseprogram.weekly.sun
            },
            {
              "day": "1",
              "on": $scope.exerciseprogram.weekly.mon
            },
            {
              "day": "2",
              "on": $scope.exerciseprogram.weekly.tue
            },
            {
              "day": "3",
              "on": $scope.exerciseprogram.weekly.wed
            },
            {
              "day": "4",
              "on": $scope.exerciseprogram.weekly.thu
            },
            {
              "day": "5",
              "on": $scope.exerciseprogram.weekly.fri
            },
            {
              "day": "6",
              "on": $scope.exerciseprogram.weekly.sat
            }

          ],
          "video_name": $scope.exerciseprogram.videoname,
          "video_data": $scope.exerciseprogram.videodata
        };

        console.log("editEx" + JSON.stringify(exercise));

        SetExerciseProgramService.editExercise(exercise, $scope.uid).then(function (success) {
          Flash.showFlash({ type: 'success', message: "Success !" });
        }, function (error) {
          Flash.showFlash({ type: 'error', message: "Failed !" });
        })

      };

    }

    //<!_________________________________________ This method is use to enable or disable the button _____________!>
    $scope.enableButtonMon = function () {
      $scope.exerciseprogram.weekly.mon == 1 ? $scope.exerciseprogram.weekly.mon = 0 : $scope.exerciseprogram.weekly.mon = 1;
    };

    $scope.enableButtonTue = function () {
      $scope.exerciseprogram.weekly.tue == 1 ? $scope.exerciseprogram.weekly.tue = 0 : $scope.exerciseprogram.weekly.tue = 1;
    };

    $scope.enableButtonWed = function () {
      $scope.exerciseprogram.weekly.wed == 1 ? $scope.exerciseprogram.weekly.wed = 0 : $scope.exerciseprogram.weekly.wed = 1;

    };

    $scope.enableButtonThu = function () {
      $scope.exerciseprogram.weekly.thu == 1 ? $scope.exerciseprogram.weekly.thu = 0 : $scope.exerciseprogram.weekly.thu = 1;
    };

    $scope.enableButtonFri = function () {
      $scope.exerciseprogram.weekly.fri == 1 ? $scope.exerciseprogram.weekly.fri = 0 : $scope.exerciseprogram.weekly.fri = 1;
    };

    $scope.enableButtonSat = function () {
      $scope.exerciseprogram.weekly.sat == 1 ? $scope.exerciseprogram.weekly.sat = 0 : $scope.exerciseprogram.weekly.sat = 1;
    };

    $scope.enableButtonSun = function () {
      $scope.exerciseprogram.weekly.sun == 1 ? $scope.exerciseprogram.weekly.sun = 0 : $scope.exerciseprogram.weekly.sun = 1;
    };

    $scope.setReps = function (reps) {
      $scope.exerciseprogram.reps = reps;
    };
    $scope.setSets = function (sets) {
      $scope.exerciseprogram.sets = sets;
    };
    $scope.setDaily = function (daily) {
      $scope.exerciseprogram.daily = daily;
    };

    //<!_________________________________________ This method is use to enable or disable the button _____________!>


    $scope.resizeIframe = function (obj) {
      //   alert(""+ obj.style.height);
      //  obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
      //  alert(""+ JSON.stringify(obj));
    }

    // Code for upload video 

    $scope.clip = '';


    var setExcpopup;
    $scope.captureVideo = function () {

      setExcpopup = $ionicPopup.show({
        template: '<div style="font-weight:bold;"> <button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromCamera()">From camera</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromGallery()">From gallery</button></div>',
        // template: '<div style="background: #121516; color: #fff;"> <button class="button button-block btn-yellow" style="background: #121516; color: #fff;">My Mobile Device</button><button class="button button-block btn-yellow">My Library</button><button class="button button-block btn-yellow">Create New</button></div>',
        title: 'Add a video',
        scope: $scope,
        buttons: [
          { text: 'Cancel' }
        ]
      });


    };

    $scope.captureVideoFromGallery = function () {
      setExcpopup.close();
      navigator.camera.getPicture($scope.uploadVideo, onFail,
        {
          destinationType: Camera.DestinationType.DATA_URL,
          mediaType: 2,
          sourceType: 2,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
          //encodingType: 0, // 0=JPG 1=PNG
          allowEdit: true
        }
      );
    };

    $scope.uploadVideo = function (videoURI) {
      $scope.videoURI = videoURI;

      var newvideoURI = "file:///" + videoURI;

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {

        // alert('success requestFileSystem');

      }, function () {
        //error

      });

      window.resolveLocalFileSystemURL(newvideoURI, function (fileEntry) {


        fileEntry.file(function (file) {

          // alert(JSON.stringify(file)); //view full metadata
          var type = file.type;
          var nameoffile = file.name;
          $scope.exerciseprogram.videoname = file.name;

          if (file != null || file != undefined) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              var dataUrl = e.target.result;
              var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
              $scope.exerciseprogram.videodata = base64Data;
            };
          }


        }, function () {

          //error
        });

      }, function () {

        // error
      });


    };


   /* $scope.captureVideo = function () {
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 300,
        targetHeight: 300,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
      }, function (err) {
          // An error occured. Show a message to the user
      });
    }*/

    function onFail(e) { };

    $scope.captureVideoFromCamera = function () {
      setExcpopup.close();

      $cordovaCapture.captureVideo().then(function (videoData) {
        saveVideo(videoData).success(function (data) {
          $scope.clip = data;
          $scope.$apply();
        }).error(function (data) {
          console.log('ERROR: ' + data);
        });
      });
    };

    $scope.urlForClipThumb = function (clipUrl) {
      var name = clipUrl.substr(clipUrl.lastIndexOf('/') + 1);
      var trueOrigin = cordova.file.dataDirectory + name;
      var sliced = trueOrigin.slice(0, -4);
      return sliced + '.png';
    }
    $scope.showClip = function (clip) {
      console.log('show clip: ' + clip);
    }

    function createFileEntry(fileURI) {
      window.resolveLocalFileSystemURL(fileURI, function (entry) {
        return copyFile(entry);
      }, fail);
    }

    // Create a unique name for the videofile
    // Copy the recorded video to the app dir
    function copyFile(fileEntry) {
      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = makeid() + name;

      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
        fileEntry.copyTo(fileSystem2, newName, function (succ) {
          return onCopySuccess(succ);
        }, fail);
      },
        fail
      );
    }

    // Called on successful copy process
    // Creates a thumbnail from the movie
    // The name is the moviename but with .png instead of .mov
    function onCopySuccess(entry) {
      $scope.videoURI = entry.nativeURL;


      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {

        // alert('success requestFileSystem');

      }, function () {
        //error

      });

      window.resolveLocalFileSystemURL($scope.videoURI, function (fileEntry) {


        fileEntry.file(function (file) {

          // alert(JSON.stringify(file)); //view full metadata
          var type = file.type;
          var nameoffile = file.name;
          $scope.exerciseprogram.videoname = file.name;

          if (file != null || file != undefined) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              var dataUrl = e.target.result;
              var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
              $scope.exerciseprogram.videodata = base64Data;
            };
          }


        }, function () {

          //error
        });

      }, function () {

        // error
      });




      var name = entry.nativeURL.slice(0, -4);
      window.PKVideoThumbnail.createThumbnail(entry.nativeURL, name + '.png', function (prevSucc) {
        return prevImageSuccess(prevSucc);
      }, fail);
    }

    // Called on thumbnail creation success
    // Generates the currect URL to the local moviefile
    // Finally resolves the promies and returns the name
    function prevImageSuccess(succ) {
      var correctUrl = succ.slice(0, -4);
      correctUrl += '.MOV';
      deferred.resolve(correctUrl);
    }

    // Called when anything fails
    // Rejects the promise with an Error

    var deferred = $q.defer();
    var promise = deferred.promise;

    promise.success = function (fn) {
      promise.then(fn);
      return promise;
    }
    promise.error = function (fn) {
      promise.then(null, fn);
      return promise;
    }

    function fail(error) {
      console.log('FAIL: ' + error.code);
      // deferred.reject('ERROR');
    }

    // Function to make a unique filename
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    // The object and functions returned from the Service

    function saveVideo(data) {
      createFileEntry(data[0].localURL);
      return promise;
    }

    ////// End

  }])


  .filter('trusted', ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }])


  .controller('SetActivityGoalsCtrl', ['$scope', '$state', 'sortedByList', '$ionicHistory', '$rootScope', 'Flash', '$window', '$stateParams', 'AppService',
    function ($scope, $state, sortedByList, $ionicHistory, $rootScope, Flash, $window, $stateParams, AppService) {
      //$scope.setActivityGoals = {};


      $scope.patientData = $stateParams.name;
      $scope.sortedByList = sortedByList;
      $scope.title = 'Set Activity Goals';
      $scope.subNavList = false;

      $scope.showList = function () {
        $scope.subNavList = !$scope.subNavList;
      }

      // $scope.gotoHome = function () {
      //   console.log("-------------------")
      //   console.log("Activity =Go TO HOME")
      //   console.log("-------------------")
      //   $state.transitionTo('main.dash', {}, { reload: false });
      // }

      $scope.$on("slideEnded", function () {
        console.log($scope.slider.min + 'slider max: ' + $scope.slider.max);
        console.log($scope.slider2.min + 'slider2 max: ' + $scope.slider2.max);
      });

      //  $scope.back = function () {
      //  console.log("BACK called==")
      //   console.log($ionicHistory.viewHistory());
      //   $ionicHistory.goBack();
      // }

      var stepList = [];
      (function steps() {
        var value = 0;
        for (var i = 1; i <= 40; i++) {
          stepList.push({ id: i, steps: value + 500 });
          value += 500;
        }
        //console.log(stepList);
      })();

      $scope.myFunc = function () {
        //console.log($scope.stepspermin);
      }

      var minsArray = [];
      (function mins() {
        for (var i = 1; i <= 180; i++) {
          minsArray.push({ id: i, title: i + " mins" });
        }
      })();

      $scope.stepsList = stepList;
      //$scope.setActivityGoals.selectedSteps = $scope.stepsList[0].id;
      $scope.lightMins = minsArray;
      //$scope.setActivityGoals.lightMinsSelected = $scope.lightMins[0].id,
      $scope.moderateMins = minsArray;
      //$scope.setActivityGoals.moderateMinsSelected = $scope.moderateMins[0].id;
      $scope.vigorousMins = minsArray;
      //$scope.setActivityGoals.vigorousMinsSelected = $scope.vigorousMins[0].id;
      $scope.setActivityGoals = {
        lightMinsSelected: $scope.lightMins[0].id,
        moderateMinsSelected: $scope.moderateMins[0].id,
        vigorousMinsSelected: $scope.vigorousMins[0].id,
        selectedSteps: $scope.stepsList[0].id,
        instructions: ''
      }

      $scope.slider = {
        min: 40,
        max: 220,
        options: {
          floor: 40,
          ceil: 220
        }
      },
        $scope.slider2 = {
          min: 40,
          max: 160,
          options: {
            floor: 40,
            ceil: 160
          }
        },
        $scope.setActivityGoals.instructions = '';



      function getStateTitle(id) {
        var title = '';
        var list = $scope.sortedByList;
        for (var i = 0; i < list.length; i++) {
          if (id == list[i].id) {
            title = list[i].routingStateName;
            return title;
          }
        }
      }

      $scope.gotoAction = function (id) {
        if (id == 1) {
          $scope.subNavList = false
        } else {
          var state = getStateTitle(id);
          $state.transitionTo(state, {}, { reload: true });
        }
      }

      getTreshold = function () {
        AppService.getThreshold($rootScope.UID).then(
          function (success) {
            console.log("getThreshold")
            console.log(success)
            var tresholdData = success.data;

            $scope.slider.min = tresholdData.steps_low;
            $scope.slider.max = tresholdData.steps_high;

            $scope.slider2.min = tresholdData.hr_low;
            $scope.slider2.max = tresholdData.hr_high;

            console.log($scope.slider)
            console.log($scope.slider2)
          },
          function (error) {
            console.log(error)
          });
      }

      getActivityGoal = function () {
        AppService.getActivityGoal($rootScope.UID).then(
          function (success) {
            console.log("getActivity")
            console.log(success)
            var activityData;
            var tempData = success.data;

            var Tdate = moment().utcOffset('-07:00').format('L');
            var today = moment(Tdate)

            for (var x in tempData) {
              var unixDate = tempData[x].goal_date
              var newDate = moment.unix(unixDate).utcOffset('-07:00').format('L');
              var NnewDate = moment(newDate)
              if (NnewDate.diff(today) == 0) {
                activityData = success.data;
              }
            }
            console.log(activityData)
            if (activityData == undefined || activityData == null) {
              $scope.setActivityGoals.lightMinsSelected = $scope.lightMins[0].id
              $scope.setActivityGoals.moderateMinsSelected = $scope.moderateMins[0].id
              $scope.setActivityGoals.vigorousMinsSelected = $scope.vigorousMins[0].id
              $scope.setActivityGoals.selectedSteps = $scope.stepsList[0].id
              $scope.setActivityGoals.instructions = ''
            }
            else {
              var minId = activityData.time_active_low;
              $scope.setActivityGoals.lightMinsSelected = $scope.lightMins[minId].id
              var modId = activityData.time_active_medium;
              $scope.setActivityGoals.moderateMinsSelected = $scope.moderateMins[modId].id;
              var higId = activityData.time_active_high;
              $scope.setActivityGoals.vigorousMinsSelected = $scope.vigorousMins[higId].id;
              var steps = activityData.total_steps;
              $scope.setActivityGoals.selectedSteps = $scope.stepsList[steps].id;
              $scope.setActivityGoals.instructions = activityData.instructions
            }
          },
          function (error) {
            console.log(error)
          });
      }

      init = function () {
        console.log($rootScope.UID)
        getTreshold();
        getActivityGoal();

      }
      init();

      $scope.setActivityGoals = function () {
        var success = true;

        var tresholdData = {
          "steps_min": '5',
          "steps_low": $scope.slider.min,
          "steps_high": $scope.slider.max,
          "hr_low": $scope.slider2.min,
          "hr_high": $scope.slider2.max,
        }
        console.log(tresholdData)
        AppService.setThreshold(tresholdData, $rootScope.UID).then(
          function (success) {
            console.log("SUCCESS")
            getTreshold();
          },
          function (error) {
            console.log("ERROR")
            success = false;
          });

        var activityData = {
          "goal_date": null,
          "total_steps": $scope.setActivityGoals.selectedSteps,
          "time_active_low": $scope.setActivityGoals.lightMinsSelected,
          "time_active_medium": $scope.setActivityGoals.moderateMinsSelected,
          "time_active_high": $scope.setActivityGoals.vigorousMinsSelected,
          "instructions": $scope.setActivityGoals.instructions,
          "exercise": null,
        }
        console.log(activityData)
        AppService.setActivityGoal(activityData, $rootScope.UID).then(
          function (success) {
            console.log("SUCCESS")
            getActivityGoal();
          },
          function (error) {
            console.log("ERROR")
            success = false;
          });

        if (success) {
          Flash.showFlash({ type: 'success', message: "Success !" });
        }
        else {
          Flash.showFlash({ type: 'error', message: "Failed !" });
        }

      }


    }])
  .controller('AddPatientCtrl', ['$scope', '$rootScope', 'Flash', '$ionicHistory', '$state', 'AppService', 'MyAccount',
    function ($scope, $rootScope, Flash, $ionicHistory, $state, AppService, MyAccount) {

      $scope.enterprise = true;
      init = function () {

        MyAccount.myAccountDetails().then(function (success) {
          $scope.enterprise = success.enterprise;
        }, function (error) {

        })

      }

      $scope.data = {
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        amount: "",
        send_email: 1
        //send_email: 0
      };


      /*function checkEmptyFields() {
        var isEmpty = false;
        for (var property in $scope.data) {
          if ($scope.data.hasOwnProperty(property)) {
            if (!$scope.data[property]) {
              isEmpty = true;
            }
          }
        }
        return isEmpty;
      }*/

      function checkEmail(email) {
        var result = false;
        var pattern = $rootScope.Regex.email;
        result = pattern.test(email);
        return result;
      }

      function checkPass(password, confirmPassword) {
        var result = false;
        result = (password == confirmPassword);
        return result;
      }

      $scope.checkPassword = function () {
        var password = document.getElementById('password');
        var confirmPassword = document.getElementById('confirmPassword');
        var message = document.getElementById('confirmMessage');

        var badColor = "#ff6666";
        if (password.value == confirmPassword.value) {
          message.style.color = '';
          message.innerHTML = ''
        }
        else {
          message.style.color = badColor;
          message.innerHTML = "Password & confirm password do not match!"
        }
      }

      $scope.checkAmount = function () {
        var amount = document.getElementById('amount');
        var message = document.getElementById('amountMessage');

        var data = parseFloat(amount.value)
        var badColor = "#ff6666";
        if (data < 0 || data > 10000) {
          message.style.color = badColor;
          message.innerHTML = "Please enter an amount between 0 and 1000!"
        }
        else {
          message.style.color = '';
          message.innerHTML = ''
        }
      }

      $scope.addPatient = function (data) {

        var amount = parseFloat(data.amount)
        $scope.data.amount = Math.round(amount / 100) * 100
        console.log($scope.data.amount)

        var validAmount = false;
        if (data.amount < 0 || data.amount > 10000) {
          validAmount = false
        }
        else {
          validAmount = true
        }

        if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
          if (checkEmail(data.email)) {
            if (checkPass(data.password, data.confirmPassword)) {
              if (validAmount) {
                console.log($scope.data)
                AppService.addPatient($scope.data).then(
                  function (success) {
                    console.log(success)
                    var successMessage = success.data.message
                    if (successMessage) {
                      Flash.showFlash({ type: 'error', message: successMessage });
                    }
                    else {
                      $scope.data = {};
                      Flash.showFlash({ type: 'success', message: "Success !" });
                      $state.go('main.dash', {}, { reload: true });
                    }
                  },
                  function (error) {
                    console.log(error)
                  });
              }
              else {
                Flash.showFlash({ type: 'error', message: "Please enter valid Subscription Amount!" });
              }
            }
            else {
              Flash.showFlash({ type: 'error', message: "ConfirmPassword is not valid !" });
            }
          } else {
            Flash.showFlash({ type: 'error', message: "Email is not valid !" });
          }
        } else {
          Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        }
      }

      init();

    }])

  .controller('ExerciseLibraryCtrl', ['$scope', 'sortedByList', '$ionicPopup', 'ExerciseLibraryService', '$state', function ($scope, sortedByList, $ionicPopup, ExerciseLibraryService, $state) {

    var pageSize = 10;
    $scope.pages = [];
    $scope.webExPages = [];


    $scope.title = 'Exercise Name';

    $scope.subNavList = false;

    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }

    $scope.sortType = 'title'; // set the default sort type
    // $scope.sortReverse = false;  // set the default sort order
    $scope.searchName = '';     // set the default search/filter term
    //$scope.sortOrder = false;

    $scope.showWebexMessage = function () {
      if ($scope.WebExerciseIcon) {
        var alertPopup = $ionicPopup.alert({
          title: 'Web Exercise add',
          template: 'To add new WebEx exercises, please go to the PT Portal (https://app.geiafit.com/)'
        });
      }
      else {
        $state.transitionTo("addExercise", {}, { reload: true });
      }

    }


    function compare(a, b) {
      if (a.title < b.title)
        return -1;
      if (a.title > b.title)
        return 1;
      return 0;
    }

    $scope.sortByGroup = function (categoryName, exerciseType) {
      var categoryArrayList = [];
      var nonCatArrayList = [];
      var result = [];
      var data = [];
      if (exerciseType == "myE") {
        data = $scope.myExerciseList;
      } else if (exerciseType = "webE") {
        data = $scope.webExercise;
      }

      angular.forEach(data, function (value, key) {
        var flag = false;
        if (angular.isArray(value.categories) && value.categories.length > 0) {
          for (var index = 0; index < value.categories.length; index++) {
            if (value.categories[index].toLowerCase() == categoryName.toLowerCase()) {
              flag = true;
              break;
            }
          }
        }
        if (flag == true) {
          categoryArrayList.push(value);
        } else {
          nonCatArrayList.push(value);
        }
      });
      categoryArrayList.sort(compare);
      nonCatArrayList.sort(compare);
      if (exerciseType == "myE") {
        $scope.myExerciseList = categoryArrayList.concat(nonCatArrayList);
        console.log($scope.myExerciseList);
      } else if (exerciseType = "webE") {
        $scope.webExercise = categoryArrayList.concat(nonCatArrayList);
        console.log($scope.webExercise);
      }


    }


    $scope.doSort = function (id, service) {
      switch (id) {
        case "1":
          $scope.sortByGroup("title", service)
          $scope.title = 'Exercise Name'
          $scope.subNavList = false;
          break;
        case "2":
          //$scope.title = 'Category'
          break;
        case "3":
          //$scope.title = 'Upper Extremity';
          break;
        case "4":
          $scope.title = 'Shoulder'
          $scope.sortByGroup("shoulder", service)
          $scope.subNavList = false;
          break;
        case "5":
          $scope.title = 'Elbow'
          $scope.sortByGroup("elbow", service)
          $scope.subNavList = false;
          break;
        case "6":
          $scope.title = 'Wrist'
          $scope.sortByGroup("wrist", service)
          $scope.subNavList = false;
          break;
        case "7":
          $scope.title = 'Hand'
          $scope.sortByGroup("hand", service)
          $scope.subNavList = false;
          break;
        case "8":
          //$scope.title = 'Lower Extremity'
          break;
        case "9":
          $scope.title = 'Hip'
          $scope.sortByGroup("hip", service)
          $scope.subNavList = false;
          break;
        case "10":
          $scope.title = 'Knee'
          $scope.sortByGroup("knee", service)
          $scope.subNavList = false;
          break;
        case "11":
          $scope.title = 'Foot'
          $scope.sortByGroup("foot", service)
          $scope.subNavList = false;
          break;
        default:
          $scope.sortType = 'title';
          $scope.sortOrder = true;
          break;
      }
      //$scope.subNavList = false;
    }

    setTags = function (data) {
      var tag = [];
      if (data.length >= 3) {
        console.log(3)
        tag[0] = data[0];
        tag[1] = data[1];
        tag[2] = data[2];
      } else
        if (data.length == 2) {
          console.log(2)
          tag[0] = data[0];
          tag[1] = data[1];
          tag[2] = "";
        } else if (data.length == 1) {
          console.log(2)
          tag[0] = data[0];
          tag[1] = ""
          tag[2] = "";
        } else if (data.length == 0) {
          console.log(1)
          tag[0] = "";
          tag[1] = ""
          tag[2] = "";
        }
      return tag;
    }

    init = function () {

      $scope.sortedByList = sortedByList;
      $scope.sortedBy = $scope.sortedByList[0].id;
      $scope.selectedTab = 'My Exercises';
      $scope.exerciseView = true;
      $scope.webExView = false;
      $scope.tempWebExList = "";
      $scope.WebExerciseIcon = false;
      $scope.MyExerciseIcon = true;

      var myExerList = [];
      var webExerciseList = [];
      var exerciseList = ExerciseLibraryService.exerciseData().then(function (success) {
        var exerciseData = success;
        for (i in exerciseData.exercises) {
          if (exerciseData.exercises[i].webex == '1') {
            exerciseData.exercises[i]['tags'] = setTags(exerciseData.exercises[i].categories)
            webExerciseList.push(exerciseData.exercises[i]);

          }
          else {
            exerciseData.exercises[i]['tags'] = setTags(exerciseData.exercises[i].categories)
            myExerList.push(exerciseData.exercises[i]);

          }
        }
        $scope.myExerciseList = myExerList
        $scope.webExercise = webExerciseList
        $scope.doSort("1", 'myE');
        console.log(myExerList)
        console.log(webExerciseList)
      }, function (error) {


      })

    }
    init();

    $scope.getFilteredData = function () {

    }

    // function to tab between MyExercise and Web Exercise.
    $scope.changeView = function (view) {
      switch (view) {

        case 1:

          $scope.selectedTab = 'My Exercises';
          $scope.webExView = false;
          $scope.exerciseView = true;
          $scope.doSort("1", 'myE');
          $scope.WebExerciseIcon = false;
          $scope.MyExerciseIcon = true;
          break;
        case 2:
          $scope.selectedTab = 'WebEx Exercises';
          $scope.webExView = true;
          $scope.exerciseView = false;
          $scope.doSort("1", 'webE');
          $scope.WebExerciseIcon = true
          $scope.MyExerciseIcon = false;
          break;
        default:
          $scope.selectedTab = 'My Exercises';
          $scope.exerciseView = true;
          $scope.doSort("1", 'myE');
          $scope.WebExerciseIcon = false;
          $scope.MyExerciseIcon = true;
      }
      this.filterPatient = undefined;
    }

    $scope.data = {
      model: null,
      availableOptions: [

        { id: '1', name: 'Exercise Name', classValue: '' },
        { id: '2', name: 'Category', classValue: 'disabledClass' },
        { id: '3', name: 'Upper Extremity', classValue: 'disabledClass' },
        { id: '4', name: 'Shoulder', classValue: '' },
        { id: '5', name: 'Elbow', classValue: '' },
        { id: '6', name: 'Wrist', classValue: '' },
        { id: '7', name: 'Hand', classValue: '' },
        { id: '8', name: 'Lower Extemity', classValue: 'disabledClass' },
        { id: '9', name: 'Hip', classValue: '' },
        { id: '10', name: 'Knee', classValue: '' },
        { id: '11', name: 'Foot', classValue: '' }
      ]
    };

    $scope.delete = function (index) {
      console.log("Delete called")
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete exercise',
        template: 'Are you sure you want to delete this exercise ?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log("delete")
          $scope.exerciseList.splice(index, 1);
        } else {
          console.log("cancel")
        }
      });
    }

  }])
  .controller('AddExerciseCtrl', ['$scope', '$state', '$stateParams', 'AddExerciseService', 'Flash','ionicPopup','$cordovaCapture', '$q', function ($scope, $state, $stateParams, AddExerciseService, Flash,ionicPopup,$cordovaCapture, $q) {

    $scope.addExercise = {
      name: "",
      comments: "",
      tags: "",
      thumbnail: "",
      video: ""
    }

    $scope.availableOptions = [
      { id: '1', name: 'Shoulder', show: 'true' },
      { id: '2', name: 'Elbow', show: 'true' },
      { id: '3', name: 'Wrist', show: 'true' },
      { id: '4', name: 'Hand', show: 'true' },
      { id: '5', name: 'Hip', show: 'true' },
      { id: '6', name: 'Knee', show: 'true' },
      { id: '7', name: 'Foot', show: 'true' }
    ]



    $scope.loadTags = function ($query) {
      var data = $scope.availableOptions;
      return data.filter(function (tempData) {
        return tempData.name.indexOf($query.toLowerCase()) != -1;
      });
    }

    init = function () {
      console.log($stateParams.exerciseObject)
      var exercise = $stateParams.exerciseObject;
      $scope.addExercise.name = exercise.title
      $scope.addExercise.comments = exercise.comments
      $scope.addExercise.tags = exercise.categories
      $scope.addExercise.thumbnail = exercise.image1
      $scope.addExercise.video = exercise.mp4
      console.log($scope.addExercise.tags)
    }
    if ($stateParams.exerciseObject != null) {
      init();
    }

    $scope.updateExercise = function () {
      var categoryList = [];
      for (var x in $scope.addExercise.tags) {
        categoryList.push($scope.addExercise.tags[x].name)
      }
      var xid = null
      if ($stateParams.exerciseObject != null) {
        xid = $stateParams.exerciseObject.exid
      }

      var data = {
        "exid": xid,
        "video_title": $scope.addExercise.name,
        "video_name": $scope.addExercise.videoname,
        "video_data": $scope.addExercise.videodata,
        "video_image_name": "george.jpg",
        "video_image": "AAAAFGZ0eXBxdCAgAAAAAHF0ICAAAAAId2lkZQASLJ1tZGF0AMxABwDom+7Mmy5PA4TVKBYzFJXz.....",
        "notes": "",
        "comments": $scope.addExercise.comments,
        "categories": categoryList
      }
      console.log(data)
      var editExerciseList = AddExerciseService.addExercise(data).then(function (success) {
        console.log("Success")
        Flash.showFlash({ type: 'success', message: "Success!" });
      }, function (error) {
        console.log("Error")
        Flash.showFlash({ type: 'error', message: "Failure!" });
      })
    }

    //console.log($scope.addExercise.tags);
    $scope.gotoExerciseProgram = function () {
      $state.transitionTo("main.exerciseLibrary", {}, { reload: true });
    }


    // Code for upload video 

    $scope.clip = '';


    var setExcpopup;
    $scope.captureVideo = function () {

      setExcpopup = $ionicPopup.show({
        template: '<div style="font-weight:bold;"> <button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromCamera()">From camera</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="captureVideoFromGallery()">From gallery</button></div>',
        // template: '<div style="background: #121516; color: #fff;"> <button class="button button-block btn-yellow" style="background: #121516; color: #fff;">My Mobile Device</button><button class="button button-block btn-yellow">My Library</button><button class="button button-block btn-yellow">Create New</button></div>',
        title: 'Add a video',
        scope: $scope,
        buttons: [
          { text: 'Cancel' }
        ]
      });


    };

    $scope.captureVideoFromGallery = function () {
      setExcpopup.close();
      navigator.camera.getPicture($scope.uploadVideo, onFail,
        {
          destinationType: Camera.DestinationType.DATA_URL,
          mediaType: 2,
          sourceType: 2,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
          //encodingType: 0, // 0=JPG 1=PNG
          allowEdit: true
        }
      );
    };

    $scope.uploadVideo = function (videoURI) {
      $scope.addExercise.video = videoURI;

      var newvideoURI = "file:///" + videoURI;

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {

        // alert('success requestFileSystem');

      }, function () {
        //error

      });

      window.resolveLocalFileSystemURL(newvideoURI, function (fileEntry) {


        fileEntry.file(function (file) {

          // alert(JSON.stringify(file)); //view full metadata
          var type = file.type;
          var nameoffile = file.name;
          $scope.addExercise.videoname = file.name;

          if (file != null || file != undefined) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              var dataUrl = e.target.result;
              var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
              $scope.addExercise.videodata = base64Data;
            };
          }


        }, function () {

          //error
        });

      }, function () {

        // error
      });


    };


    function onFail(e) { };

    $scope.captureVideoFromCamera = function () {
     setExcpopup.close();
      $cordovaCapture.captureVideo().then(function (videoData) {
        saveVideo(videoData).success(function (data) {
          $scope.clip = data;
          $scope.$apply();
        }).error(function (data) {
          console.log('ERROR: ' + data);
        });
      });
    };

    $scope.urlForClipThumb = function (clipUrl) {
      var name = clipUrl.substr(clipUrl.lastIndexOf('/') + 1);
      var trueOrigin = cordova.file.dataDirectory + name;
      var sliced = trueOrigin.slice(0, -4);
      return sliced + '.png';
    }
    $scope.showClip = function (clip) {
      console.log('show clip: ' + clip);
    }

    function createFileEntry(fileURI) {
      window.resolveLocalFileSystemURL(fileURI, function (entry) {
        return copyFile(entry);
      }, fail);
    }

    // Create a unique name for the videofile
    // Copy the recorded video to the app dir
    function copyFile(fileEntry) {
      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = makeid() + name;

      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fileSystem2) {
        fileEntry.copyTo(fileSystem2, newName, function (succ) {
          return onCopySuccess(succ);
        }, fail);
      },
        fail
      );
    }

    // Called on successful copy process
    // Creates a thumbnail from the movie
    // The name is the moviename but with .png instead of .mov
    function onCopySuccess(entry) {
      $scope.addExercise.video = entry.nativeURL;


      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function () {

        // alert('success requestFileSystem');

      }, function () {
        //error

      });

      window.resolveLocalFileSystemURL($scope.addExercise.video, function (fileEntry) {


        fileEntry.file(function (file) {

          // alert(JSON.stringify(file)); //view full metadata
          var type = file.type;
          var nameoffile = file.name;
          $scope.addExercise.videoname = file.name;

          if (file != null || file != undefined) {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              var dataUrl = e.target.result;
              var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
              $scope.addExercise.videodata = base64Data;
            };
          }


        }, function () {

          //error
        });

      }, function () {

        // error
      });


      var name = entry.nativeURL.slice(0, -4);
      window.PKVideoThumbnail.createThumbnail(entry.nativeURL, name + '.png', function (prevSucc) {
        return prevImageSuccess(prevSucc);
      }, fail);
    }

    // Called on thumbnail creation success
    // Generates the currect URL to the local moviefile
    // Finally resolves the promies and returns the name
    function prevImageSuccess(succ) {
      var correctUrl = succ.slice(0, -4);
      correctUrl += '.MOV';
      deferred.resolve(correctUrl);
    }

    // Called when anything fails
    // Rejects the promise with an Error

    var deferred = $q.defer();
    var promise = deferred.promise;

    promise.success = function (fn) {
      promise.then(fn);
      return promise;
    }
    promise.error = function (fn) {
      promise.then(null, fn);
      return promise;
    }

    function fail(error) {
      console.log('FAIL: ' + error.code);
      // deferred.reject('ERROR');
    }

    // Function to make a unique filename
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    // The object and functions returned from the Service

    function saveVideo(data) {
      createFileEntry(data[0].localURL);
      return promise;
    }

    ////// End



  }])
  .filter('trusted', ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }])


  .controller('AddExercisePopupCtrl', ['$scope', '$state', 'SetExerciseProgramService', function ($scope, $state, SetExerciseProgramService) {

  }])



  .controller('MyAccountCtrl', ['$scope', '$rootScope', 'Flash', '$ionicHistory', '$state', '$cordovaCamera', 'MyAccount', function ($scope, $rootScope, Flash, $ionicHistory, $state, $cordovaCamera, MyAccount) {

    var profileData;
    $scope.picFile = "";
    $scope.profilePic = "";

    $scope.profile = {
      name: "",
      email: "",
      phone: ""
    }
    init = function () {
      MyAccount.myAccountDetails().then(function (success) {
        profileData = success;
        console.log(profileData)
        $scope.profile.name = profileData.first_name + ' ' + profileData.last_name;
        $scope.profile.email = profileData.email;
        $scope.profile.phone = profileData.phone;
        $scope.showPhoto = true
        $scope.src = profileData.image;
      }, function (error) {

      })

    }
    init();

    $scope.config = {
      showCP: false
    };
    // $scope.profile = profileData;
    $scope.editEnabled = false;

    $scope.testFunction = function (file) {
      if (file != null || file != undefined) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = function (e) {
          var dataUrl = e.target.result;
          var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);

          var data = {
            image_name: file.$ngfName,
            image: base64Data
          }

          MyAccount.uploadImage(data).then(function (success) {
            console.log(success)
            init();
          }, function (error) {
            console.log(error)
          })

        };
      }
      //     //  $scope.src = "https://trip101.com/assets/default_profile_pic-9c5d869a996318867438aa3ccf9a9607daee021047c1088645fbdfbbed0e2aec.jpg"
    }

    $scope.setProfilePhoto = function () {
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.IMAGE
      };

      $cordovaCamera.getPicture(options).then(function (uri) {
        $scope.src = uri;
        $scope.showPhoto = true;
      }, function (err) {
        console.log(err);
      });
    }
    $scope.checkEmptyFields = function () {
      var isEmpty = false;
      var data = $scope.profile;
      var keys = [
        'name',
        'email'
      ];
      for (var property in data) {
        if (keys.indexOf(property) == -1) {
          continue;
        }
        if (data.hasOwnProperty(property)) {
          if (!data[property]) {
            isEmpty = true;
            break;
          }
        }
      }
      return isEmpty;
    }

    function checkEmail(email) {
      var result = false;
      var pattern = $rootScope.Regex.email;
      result = pattern.test(email);
      return result;
    }

    $scope.save = function (data) {

      if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
        if (!$scope.checkEmptyFields()) {
          var names = $scope.profile.name.split(" ");
          var params = {
            email: $scope.profile.email,
            first_name: names ? names[0] : "",
            last_name: names ? names[1] : "",
            phone: $scope.profile.phone,
          };
          console.log($rootScope.currentPassword);
          if ($scope.config.showCP) {
            if ($rootScope.currentPassword != $scope.profile.password) {
              Flash.showFlash({ type: 'error', message: "The old password is incorrect!" });
              return;
            }
            if (!$scope.profile.newPassword) {
              Flash.showFlash({ type: 'error', message: "Please fill the password!" });
              return;
            }
            if ($scope.profile.passwordRepeat != $scope.profile.newPassword) {
              Flash.showFlash({ type: 'error', message: "Password & confirm password do not match!" });
              return;
            }
            if (!checkEmail(data.email)) {
              Flash.showFlash({ type: 'error', message: "Email is not valid !" });
              return;
            }
            params.password = $scope.profile.newPassword;
          }
          console.log($scope.config.showCP);
          console.log(params);

          MyAccount.saveProfile(params).then(function (response) {
            console.log(response)
            Flash.showFlash({ type: 'success', message: "Success !" });
          }, function (error) {
            Flash.showFlash({ type: 'error', message: "Failed to save profile" });
          })
        }
        else {
          Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        }
      } else {
        Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
      }
    }



  }])



  .controller('ActivityCtrl', ['$scope', '$stateParams', 'sortedByList', '$state', '$rootScope', 'AppService', 'utilityService', function ($scope, $stateParams, sortedByList, $state, $rootScope, AppService, utilityService) {
    $scope.DefaultView = true;
    $rootScope.patientName = $stateParams.name;

    var patientData;
    var ActivityData;
    var complianceData;
    var weekDates = [];
    var activityDataForWeek = [];
    var complianceDataForWeek = [];
    var activityDataForMonth = [];
    var complianceDataForMonth = [];
    var activityDataForYesterday = '';
    var monthList = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    $scope.title = 'Activity';

    $scope.subNavList = false;

    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }

    getActivityDataForYesterday = function (successData) {
      var date = moment().utcOffset('-07:00').subtract(1, 'days').startOf('day').format('L');
      var Ndate = moment(date)

      for (var x in successData) {
        var unixDate = successData[x].updated
        var newDate = moment.unix(unixDate).utcOffset('-07:00').format('L');
        var NnewDate = moment(newDate)

        if (Ndate.diff(NnewDate) == 0) {
          activityDataForYesterday = successData[x];
        }
      }
      chartConfigForDay();
    }

    chartConfigForDay = function () {
      var excPer = 0;
      var stepsPer = 0;
      var lowPer = 0;
      var mediumPer = 0;
      var highPer = 0;

      $scope.DayExeDone = 0;
      $scope.DayExeGoal = 0;
      $scope.DayStepsDone = 0;
      $scope.DayStepsGoal = 0;
      $scope.DayLowDone = 0;
      $scope.DayLowGoal = 0;
      $scope.DayMidDone = 0;
      $scope.DayMidGoal = 0;
      $scope.DayHighDone = 0;
      $scope.DayHighGoal = 0;

      if (activityDataForYesterday.total_exercise != null && activityDataForYesterday.total_exercise_goal != null) {
        var goal = activityDataForYesterday.total_exercise_goal;
        var achieved = activityDataForYesterday.total_exercise;
        $scope.DayExeDone = achieved;
        $scope.DayExeGoal = goal;
        excPer = (achieved / goal) * 100;
      }
      if (activityDataForYesterday.total_steps != null && activityDataForYesterday.total_steps_goal != null) {
        var goal = activityDataForYesterday.total_steps_goal;
        var achieved = activityDataForYesterday.total_steps;
        $scope.DayStepsDone = achieved;
        $scope.DayStepsGoal = goal;
        stepsPer = (achieved / goal) * 100;
      }
      if (activityDataForYesterday.time_active_low != null && activityDataForYesterday.time_active_low_goal != null) {
        var goal = activityDataForYesterday.time_active_low_goal;
        var achieved = activityDataForYesterday.time_active_low;
        $scope.DayLowDone = achieved;
        $scope.DayLowGoal = goal;
        lowPer = (achieved / goal) * 100;
      }
      if (activityDataForYesterday.time_active_medium != null && activityDataForYesterday.time_active_medium_goal != null) {
        var goal = activityDataForYesterday.time_active_medium_goal;
        var achieved = activityDataForYesterday.time_active_medium;
        $scope.DayMidDone = achieved;
        $scope.DayMidGoal = goal;
        mediumPer = (achieved / goal) * 100;
      }
      if (activityDataForYesterday.time_active_high != null && activityDataForYesterday.time_active_high_goal != null) {
        var goal = activityDataForYesterday.time_active_high_goal;
        var achieved = activityDataForYesterday.time_active_high;
        $scope.DayHighDone = achieved;
        $scope.DayHighGoal = goal;
        highPer = (achieved / goal) * 100;
      }

      $scope.chartConfig = getChartConfigForDay(excPer, '#4299D1', '#1F60A4');
      $scope.chartConfig1 = getChartConfigForDay(stepsPer, '#4299D1', '#1F60A4');
      $scope.chartConfig2 = getChartConfigForDay(lowPer, '#DDF6BC', '#B8E986');
      $scope.chartConfig3 = getChartConfigForDay(mediumPer, '#00CBEF', '#009CDB');
      $scope.chartConfig4 = getChartConfigForDay(highPer, '#4299D1', '#1F60A4');
    }

    getWeekDates = function () {
      var TstartDate = moment().utcOffset('-07:00').subtract(7, 'days').format('L');
      var startDate = moment(TstartDate)
      var TendDate = moment().utcOffset('-07:00').format('L');
      var endDate = moment(TendDate)

      var weekDates = [];
      //var date = startDate;
      while (startDate.diff(endDate) < 0) {
        weekDates.push(startDate)
        var tempDate = startDate.add(1, 'days').format('L');
        startDate = moment(tempDate);
      }



      /*var TstartDate = moment().utcOffset('-07:00').subtract(6, 'days').format('L');
      var startDate = moment(TstartDate)
      var TendDate = moment().utcOffset('-07:00').format('L');
      var endDate = moment(TendDate)

      var dateList = [];
      var tempDate = startDate;
      var i = 0;

      while (tempDate.diff(endDate) <= 0) {
        dateList.push(tempDate)
        var Tdate = startDate.add(1, 'days').startOf('day').format('L');
        tempDate = moment(Tdate);
      }*/

      return weekDates;
    }

    getActivityDataForWeek = function (successData) {
      activityDataForWeek = [];
      var TstartDate = moment().utcOffset('-07:00').subtract(7, 'days').startOf('day').format('L');
      var startDate = moment(TstartDate);
      var TendDate = moment().utcOffset('-07:00').format('L');
      var endDate = moment(TendDate);

      for (var x in successData) {
        var unixDate = successData[x].created
        var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
        var date = moment(Tdate)

        if (date.diff(startDate) >= 0 && date.diff(endDate) <= 0) {
          activityDataForWeek.push(successData[x]);
        }
      }
      chartConfigForWeek();
    }

    chartConfigForWeek = function () {
      var dataWeekExerciseGoal = [];
      var dataWeekStepsGoal = [];
      var dataWeekLightGoal = [];
      var dataWeekModerateGoal = [];
      var dataWeekVigorousGoal = [];

      var dataWeekExerciseComp = [];
      var dataWeekStepsComp = [];
      var dataWeekLightComp = [];
      var dataWeekModerateComp = [];
      var dataWeekVigorousComp = [];

      var dataWeekExerciseExce = [];
      var dataWeekStepsExce = [];
      var dataWeekLightExce = [];
      var dataWeekModerateExce = [];
      var dataWeekVigorousExce = [];

      var totalWeekExe = 0;
      var totalWeekSteps = 0;
      var totalWeekLow = 0;
      var totalWeekMid = 0;
      var totalWeekHigh = 0;

      var weekDates = getWeekDates();
      var onlyDates = [];

      for (var d in weekDates) {
        console.log(weekDates[d])
        onlyDates.push(weekDates[d].date())
        var total_exercise_goal = 0
        var total_exercise = 0
        var total_exercise_exceed = 0
        var total_steps_goal = 0
        var total_steps = 0
        var total_steps_exceed = 0
        var time_active_low_goal = 0
        var time_active_low = 0
        var time_active_low_exceed = 0
        var time_active_medium_goal = 0
        var time_active_medium = 0
        var time_active_medium_exceed = 0
        var time_active_high_goal = 0
        var time_active_high = 0
        var time_active_high_exceed = 0

        for (var x in activityDataForWeek) {
          var unixDate = activityDataForWeek[x].created
          var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
          var tempDate = moment(Tdate)

          if (tempDate.diff(weekDates[d]) == 0) {

            var temp = activityDataForWeek[x];

            if (temp.total_exercise_goal != null && temp.total_exercise != null) {
              var goal = parseInt(temp.total_exercise_goal)
              var done = parseInt(temp.total_exercise)

              if (goal > done) {
                total_exercise_goal = goal - done
                total_exercise = done
              }
              if (goal < done) {
                total_exercise_exceed = done - goal
                total_exercise = goal
              }
              if (goal == done) {
                total_exercise = done
              }

            }

            if (temp.total_steps_goal != null && temp.total_steps != null) {
              var goal = parseInt(temp.total_steps_goal)
              var done = parseInt(temp.total_steps)

              if (goal > done) {
                total_steps_goal = goal - done
                total_steps = done
              }
              if (goal < done) {
                total_steps_exceed = done - goal
                total_steps = goal
              }
              if (goal == done) {
                total_steps = done
              }
            }

            if (temp.time_active_low_goal != null && temp.time_active_low != null) {
              var goal = parseInt(temp.time_active_low_goal)
              var done = parseInt(temp.time_active_low)

              if (goal > done) {
                time_active_low_goal = goal - done
                time_active_low = done
              }
              if (goal < done) {
                time_active_low_exceed = done - goal
                time_active_low = goal
              }
              if (goal == done) {
                time_active_low = done
              }
            }

            if (temp.time_active_medium_goal != null && temp.time_active_medium != null) {
              var goal = parseInt(temp.time_active_medium_goal)
              var done = parseInt(temp.time_active_medium)

              if (goal > done) {
                time_active_medium_goal = goal - done
                time_active_medium = done
              }
              if (goal < done) {
                time_active_medium_exceed = done - goal
                time_active_medium = goal
              }
              if (goal == done) {
                time_active_medium = done
              }
            }

            if (temp.time_active_high_goal != null && temp.time_active_high != null) {
              var goal = parseInt(temp.time_active_high_goal)
              var done = parseInt(temp.time_active_high)

              if (goal > done) {
                time_active_high_goal = goal - done
                time_active_high = done
              }
              if (goal < done) {
                time_active_high_exceed = done - goal
                time_active_high = goal
              }
              if (goal == done) {
                time_active_high = done
              }
            }

            totalWeekExe = totalWeekExe + total_exercise;
            totalWeekSteps = totalWeekSteps + total_steps;
            totalWeekLow = totalWeekLow + time_active_low;
            totalWeekMid = totalWeekMid + time_active_medium;
            totalWeekHigh = totalWeekHigh + time_active_high;
            break;
          }
        }
        dataWeekExerciseGoal.push(total_exercise_goal);
        dataWeekStepsGoal.push(total_steps_goal);
        dataWeekLightGoal.push(time_active_low_goal);
        dataWeekModerateGoal.push(time_active_medium_goal);
        dataWeekVigorousGoal.push(time_active_high_goal);

        dataWeekExerciseComp.push(total_exercise);
        dataWeekStepsComp.push(total_steps);
        dataWeekLightComp.push(time_active_low);
        dataWeekModerateComp.push(time_active_medium);
        dataWeekVigorousComp.push(time_active_high);

        dataWeekExerciseExce.push(total_exercise_exceed);
        dataWeekStepsExce.push(total_steps_exceed);
        dataWeekLightExce.push(time_active_low_exceed);
        dataWeekModerateExce.push(time_active_medium_exceed);
        dataWeekVigorousExce.push(time_active_high_exceed);
      }

      $scope.totalWeekExe = (totalWeekExe == null) ? 0 : totalWeekExe;
      $scope.totalWeekSteps = (totalWeekSteps == null) ? 0 : totalWeekSteps;
      $scope.totalWeekLow = (totalWeekLow == null) ? 0 : totalWeekLow;
      $scope.totalWeekMid = (totalWeekMid == null) ? 0 : totalWeekMid;
      $scope.totalWeekHigh = (totalWeekHigh == null) ? 0 : totalWeekHigh;

      $scope.chartConfigWeekViewExercise = getChartConfigForWeek(dataWeekExerciseGoal, dataWeekExerciseComp, dataWeekExerciseExce, "#009CDB", onlyDates)
      $scope.chartConfigWeekViewSteps = getChartConfigForWeek(dataWeekStepsGoal, dataWeekStepsComp, dataWeekStepsExce, "#009CDB", onlyDates)
      $scope.chartConfigWeekViewLow = getChartConfigForWeek(dataWeekLightGoal, dataWeekLightComp, dataWeekLightExce, "#E0FBC6", onlyDates)
      $scope.chartConfigWeekViewMid = getChartConfigForWeek(dataWeekModerateGoal, dataWeekModerateComp, dataWeekModerateExce, "#009CDB", onlyDates)
      $scope.chartConfigWeekViewHigh = getChartConfigForWeek(dataWeekVigorousGoal, dataWeekVigorousComp, dataWeekVigorousExce, "#184370", onlyDates)
    }

    getComplianceDataForWeek = function (successData) {
      complianceDataForWeek = [];
      var TstartDate = moment().utcOffset('-07:00').subtract(7, 'days').startOf('day').format('L');
      var startDate = moment(TstartDate);
      var TendDate = moment().utcOffset('-07:00').format('L');
      var endDate = moment(TendDate);

      for (var x in successData) {
        var unixDate = successData[x].created
        var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
        var date = moment(Tdate)

        if (date.diff(startDate) >= 0 && date.diff(endDate) <= 0) {
          complianceDataForWeek.push(successData[x]);
        }
      }
      chartConfigForComplianceWeek();
    }

    chartConfigForComplianceWeek = function () {
      var dataWeekComplianceGoal = [];
      var dataWeekCompliance = [];
      var dataWeekComplianceExce = [];
      var totalWeekCompliance = 0;

      var weekDates = getWeekDates();
      var onlyDates = []

      for (var d in weekDates) {
        onlyDates.push(weekDates[d].date())

        var total_compliance_goal = 0
        var total_compliance = 0
        var total_compliance_exce = 0

        for (var x in complianceDataForWeek) {
          var unixDate = complianceDataForWeek[x].created
          var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
          var tempDate = moment(Tdate)

          if (tempDate.diff(weekDates[d]) == 0) {

            var temp = complianceDataForWeek[x];
            if (temp.daily_challenge != null && temp.daily_points != null) {
              var goal = parseInt(temp.total_compliance_goal)
              var done = parseInt(temp.total_compliance)

              if (goal > done) {
                total_compliance_goal = goal - done
                total_compliance = done
              }
              if (goal < done) {
                total_compliance_exce = done - goal
                total_compliance = goal
              }
              if (goal == done) {
                total_compliance = done
              }
            }
            break;
          }
        }
        dataWeekComplianceGoal.push(total_compliance_goal);
        dataWeekCompliance.push(total_compliance);
        dataWeekComplianceExce.push(total_compliance_exce)
      }
      $scope.chartConfigWeekViewComp = getChartConfigForWeek(dataWeekComplianceGoal, dataWeekCompliance, dataWeekComplianceExce, "#009CDB", onlyDates)
    }


    getMonthDates = function (date) {
      date = moment(date);

      var TstartDate = date.utcOffset('-07:00').startOf('month').format('L');
      var startDate = moment(TstartDate);

      var TendDate = date.utcOffset('-07:00').endOf('month').format('L');
      var endDate = moment(TendDate);

      var dateList = [];

      while (startDate.diff(endDate) < 0) {
        dateList.push(startDate)
        var tempDate = startDate.add(1, 'days').format('L')
        startDate = moment(tempDate)
      }

      return dateList;
    }

    getMonthFirstLastDates = function (date) {
      date = moment(date);

      var TstartDate = date.utcOffset('-07:00').startOf('month').format('L');
      var startDate = moment(TstartDate);

      var TendDate = date.utcOffset('-07:00').endOf('month').format('L');
      var endDate = moment(TendDate);

      var dateList = [];

      dateList.push(startDate)
      dateList.push(endDate)

      return dateList;
    }

    getActivityDataForMonth = function (successData, dateForView) {
      activityDataForMonth = [];
      var dates;
      dates = getMonthFirstLastDates($scope.DATE);
      var startDate = dates[0]
      var endDate = dates[1]

      for (var x in successData) {
        var unixDate = successData[x].created
        var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
        var date = moment(Tdate)
        if (date.diff(startDate) > 0 && date.diff(endDate) < 0) {
          activityDataForMonth.push(successData[x]);
        }
      }

      chartConfigForMonth()
    }

    chartConfigForMonth = function () {
      var dataMonthExerciseGoal = [];
      var dataMonthStepsGoal = [];
      var dataMonthLightGoal = [];
      var dataMonthModerateGoal = [];
      var dataMonthVigorousGoal = [];

      var dataMonthExerciseComp = [];
      var dataMonthStepsComp = [];
      var dataMonthLightComp = [];
      var dataMonthModerateComp = [];
      var dataMonthVigorousComp = [];

      var dataMonthExerciseExce = [];
      var dataMonthStepsExce = [];
      var dataMonthLightExce = [];
      var dataMonthModerateExce = [];
      var dataMonthVigorousExce = [];

      var totalMonthExe = 0;
      var totalMonthSteps = 0;
      var totalMonthLow = 0;
      var totalMonthMid = 0;
      var totalMonthHigh = 0;

      var dates = getMonthDates($scope.DATE);
      var onlyDates = []

      for (var d in dates) {
        onlyDates.push(dates[d].date())
        var total_exercise_goal = 0
        var total_exercise = 0
        var total_exercise_exceed = 0
        var total_steps_goal = 0
        var total_steps = 0
        var total_steps_exceed = 0
        var time_active_low_goal = 0
        var time_active_low = 0
        var time_active_low_exceed = 0
        var time_active_medium_goal = 0
        var time_active_medium = 0
        var time_active_medium_exceed = 0
        var time_active_high_goal = 0
        var time_active_high = 0
        var time_active_high_exceed = 0

        for (var x in activityDataForMonth) {
          var unixDate = activityDataForMonth[x].created
          var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
          var date = moment(Tdate)

          if (date.diff(dates[d]) == 0) {

            var temp = activityDataForMonth[x];

            if (temp.total_exercise_goal != null && temp.total_exercise != null) {
              var goal = parseInt(temp.total_exercise_goal)
              var done = parseInt(temp.total_exercise)

              if (goal > done) {
                total_exercise_goal = goal - done
                total_exercise = done
              }
              if (goal < done) {
                total_exercise_exceed = done - goal
                total_exercise = goal
              }
              if (goal == done) {
                total_exercise = done
              }

            }

            if (temp.total_steps_goal != null && temp.total_steps != null) {
              var goal = parseInt(temp.total_steps_goal)
              var done = parseInt(temp.total_steps)

              if (goal > done) {
                total_steps_goal = goal - done
                total_steps = done
              }
              if (goal < done) {
                total_steps_exceed = done - goal
                total_steps = goal
              }
              if (goal == done) {
                total_steps = done
              }
            }

            if (temp.time_active_low_goal != null && temp.time_active_low != null) {
              var goal = parseInt(temp.time_active_low_goal)
              var done = parseInt(temp.time_active_low)

              if (goal > done) {
                time_active_low_goal = goal - done
                time_active_low = done
              }
              if (goal < done) {
                time_active_low_exceed = done - goal
                time_active_low = goal
              }
              if (goal == done) {
                time_active_low = done
              }
            }

            if (temp.time_active_medium_goal != null && temp.time_active_medium != null) {
              var goal = parseInt(temp.time_active_medium_goal)
              var done = parseInt(temp.time_active_medium)

              if (goal > done) {
                time_active_medium_goal = goal - done
                time_active_medium = done
              }
              if (goal < done) {
                time_active_medium_exceed = done - goal
                time_active_medium = goal
              }
              if (goal == done) {
                time_active_medium = done
              }
            }

            if (temp.time_active_high_goal != null && temp.time_active_high != null) {
              var goal = parseInt(temp.time_active_high_goal)
              var done = parseInt(temp.time_active_high)

              if (goal > done) {
                time_active_high_goal = goal - done
                time_active_high = done
              }
              if (goal < done) {
                time_active_high_exceed = done - goal
                time_active_high = goal
              }
              if (goal == done) {
                time_active_high = done
              }
            }


            totalMonthExe = totalMonthExe + total_exercise;
            totalMonthSteps = totalMonthSteps + total_steps;
            totalMonthLow = totalMonthLow + time_active_low;
            totalMonthMid = totalMonthMid + time_active_medium;
            totalMonthHigh = totalMonthHigh + time_active_high;
            break;
          }
        }

        dataMonthExerciseGoal.push(total_exercise_goal);
        dataMonthStepsGoal.push(total_steps_goal);
        dataMonthLightGoal.push(time_active_low_goal);
        dataMonthModerateGoal.push(time_active_medium_goal);
        dataMonthVigorousGoal.push(time_active_high_goal);

        dataMonthExerciseComp.push(total_exercise);
        dataMonthStepsComp.push(total_steps);
        dataMonthLightComp.push(time_active_low);
        dataMonthModerateComp.push(time_active_medium);
        dataMonthVigorousComp.push(time_active_high);

        dataMonthExerciseExce.push(total_exercise_exceed);
        dataMonthStepsExce.push(total_steps_exceed);
        dataMonthLightExce.push(time_active_low_exceed);
        dataMonthModerateExce.push(time_active_medium_exceed);
        dataMonthVigorousExce.push(time_active_high_exceed);
      }

      $scope.totalMonthExe = (totalMonthExe == null) ? 0 : totalMonthExe;
      $scope.totalMonthSteps = (totalMonthSteps == null) ? 0 : totalMonthSteps;
      $scope.totalMonthLow = (totalMonthLow == null) ? 0 : totalMonthLow;
      $scope.totalMonthMid = (totalMonthMid == null) ? 0 : totalMonthMid;
      $scope.totalMonthHigh = (totalMonthHigh == null) ? 0 : totalMonthHigh;
      // $scope.lastDateOfMonth = Math.max(...onlyDates);
      $scope.lastDateOfMonth = Math.max.apply(null, onlyDates);

      /*dataMonthExerciseGoal.reverse();
      dataMonthStepsGoal.reverse();
      dataMonthLightGoal.reverse();
      dataMonthModerateGoal.reverse();
      dataMonthVigorousGoal.reverse();

      dataMonthExercise.reverse();
      dataMonthSteps.reverse();
      dataMonthLight.reverse();
      dataMonthModerate.reverse();
      dataMonthVigorous.reverse();

      onlyDates.reverse();*/

      $scope.chartConfigMonthViewExercise = getChartConfigForMonth(dataMonthExerciseGoal, dataMonthExerciseComp, dataMonthExerciseExce, "#009CDB", onlyDates)
      $scope.chartConfigMonthViewSteps = getChartConfigForMonth(dataMonthStepsGoal, dataMonthStepsComp, dataMonthStepsExce, "#009CDB", onlyDates)
      $scope.chartConfigMonthViewLow = getChartConfigForMonth(dataMonthLightGoal, dataMonthLightComp, dataMonthLightExce, "#E0FBC6", onlyDates)
      $scope.chartConfigMonthViewMid = getChartConfigForMonth(dataMonthModerateGoal, dataMonthModerateComp, dataMonthModerateExce, "#009CDB", onlyDates)
      $scope.chartConfigMonthViewHigh = getChartConfigForMonth(dataMonthVigorousGoal, dataMonthVigorousComp, dataMonthVigorousExce, "#184370", onlyDates)

    }


    getComplianceDataForMonth = function (successData, dateForView) {
      complianceDataForMonth = [];
      var dates;
      dates = getMonthFirstLastDates($scope.DATE);
      var startDate = dates[0]
      var endDate = dates[1]

      for (var x in successData) {
        var unixDate = successData[x].created
        var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
        var date = moment(Tdate)

        if (date.diff(startDate) > 0 && date.diff(endDate) < 0) {
          complianceDataForMonth.push(successData[x]);
        }
      }
      chartConfigForComplianceMonth()
    }


    chartConfigForComplianceMonth = function () {
      var dataMonthComplianceGoal = [];
      var dataMonthCompliance = [];
      var dataMonthComplianceExce = [];
      var dates = getMonthDates($scope.DATE);
      var onlyDates = []

      for (var d in dates) {
        onlyDates.push(dates[d].date())
        var total_compliance_goal = 0
        var total_compliance = 0
        var total_compliance_exceed = 0;

        for (var x in complianceDataForMonth) {
          var unixDate = complianceDataForMonth[x].created
          var Tdate = moment.unix(unixDate).utcOffset('-07:00').format('L');
          var date = moment(Tdate)

          if (date.diff(dates[d]) == 0) {
            var temp = complianceDataForMonth[x];

            if (temp.daily_challenge != null && temp.daily_points != null) {
              var goal = parseInt(temp.daily_challenge)
              var done = parseInt(temp.daily_points)

              if (goal > done) {
                total_compliance_goal = goal - done
                total_compliance = done
              }
              if (goal < done) {
                total_compliance_exceed = done - goal
                total_compliance = goal
              }
              if (goal == done) {
                total_compliance = done
              }
            }

            break;
          }
        }

        dataMonthComplianceGoal.push(total_compliance_goal);
        dataMonthCompliance.push(total_compliance);
        dataMonthComplianceExce.push(total_compliance_exceed);
      }
     
      $scope.lastDateOfMonth = Math.max.apply(null, onlyDates);
      // $scope.lastDateOfMonth = Math.max(...onlyDates);
      $scope.chartConfigMonthViewComp = getChartConfigForMonth(dataMonthComplianceGoal, dataMonthCompliance,dataMonthComplianceExce, "#009CDB",onlyDates)

    }



    $scope.prevDate = function () {

      var Tdate = moment($scope.DATE);
      var tempDate = Tdate.utcOffset('-07:00').subtract(1, 'month').format();
      $scope.DATE = moment(tempDate).endOf('month').toDate();
      console.log($scope.DATE)
      var x = moment($scope.DATE)

      console.log("Perv Selected " + $scope.DATE)

      getActivityDataForMonth(ActivityData, $scope.DATE)
      getComplianceDataForMonth(complianceData, $scope.DATE)
    }

    $scope.nextDate = function () {

      var Tdate = moment($scope.DATE);
      var tempDate = Tdate.utcOffset('-07:00').add(1, 'month').format();
      $scope.DATE = moment(tempDate).endOf('month').toDate();

      console.log("Next Selected " + $scope.DATE)

      getActivityDataForMonth(ActivityData, $scope.DATE)
      getComplianceDataForMonth(complianceData, $scope.DATE)
    }

    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;

    $scope.changeView = function (view) {
      switch (view) {
        case 1:
          $scope.selectedView = 'day';
          getActivityDataForYesterday(ActivityData);
          $scope.DayView = true;
          $scope.WeekView = false;
          $scope.MonthView = false;
          $scope.DefaultView = false;
          break;
        case 2:
          $scope.selectedView = 'week';
          getActivityDataForWeek(ActivityData);
          getComplianceDataForWeek(complianceData);
          $scope.WeekView = true;
          $scope.DayView = false;
          $scope.MonthView = false;
          $scope.DefaultView = false;
          break;
        case 3:
          $scope.selectedView = 'month';
          var Tdate = moment().utcOffset('-07:00').endOf("month").hours(0).minute(0).second(0).millisecond(0).format();
          $scope.DATE = moment(Tdate).toDate();
          console.log($scope.DATE)
          getActivityDataForMonth(ActivityData);
          getComplianceDataForMonth(complianceData);
          $scope.MonthView = true;
          $scope.DayView = false;
          $scope.WeekView = false;
          $scope.DefaultView = false;
          break;
        default:
          $scope.selectedView = 'day';
          getActivityDataForYesterday(ActivityData);
          $scope.DayView = true;
          $scope.WeekView = false;
          $scope.MonthView = false;
          $scope.DefaultView = false;
      }

    }

    init = function () {

      var Tdate = moment().utcOffset('-07:00').endOf("month").hours(0).minute(0).second(0).millisecond(0).format();
      $scope.DATE = moment(Tdate).toDate();
      console.log($scope.DATE)

      $scope.HealthPoint = 0;
      var uid = $stateParams.uid;
      if (uid == null) {
        uid = $rootScope.UID;
      }
      AppService.profile(uid).then(function (success) {
        var imageUrl;
        var gender;
        patientData = success;
        console.log(patientData)
        var age = "";
        if (!patientData.dob) {
          age = "N/A";
        } else {
          var dateOfBirth = new Date(patientData.dob);
          age = utilityService.calculcateAge(dateOfBirth) + '  years old';

        }

        if (patientData.image != "") {
          imageUrl = patientData.image
        } else {
          imageUrl = "img/profile_icon.png";
        }

        if (patientData.gender == '2') {
          gender = "male";
        } else
          if (patientData.gender == '1') {
            gender = "female";
          } else {
            gender = "N/A";
          }
        $scope.patientProfile = {
          name: patientData.first_name + " " + patientData.last_name,
          age: age,
          gender: gender,
          email: patientData.email,
          url: imageUrl
        }
        $rootScope.patientName = patientData.first_name + " " + patientData.last_name;
      }, function (error) {
      })

      console.log(uid)
      AppService.getActivity(uid).then(function (success) {
        console.log("getActivity Success")
        ActivityData = success;
        getActivityDataForYesterday(ActivityData);
        //getActivityDataForWeek(ActivityData);
        //getActivityDataForMonth(ActivityData);
      }, function (error) {
        console.log("getActivity error")
      })

      AppService.getHealthPoint(uid).then(function (success) {
        console.log("getHealthPoint Success")
        console.log(success)
        complianceData = success.daily
        var DailyHP = success.daily;
        var today = new Date();
        for (var x in DailyHP) {
          var unixDate = DailyHP[x].created
          var date = utilityService.unixTimeToDate(unixDate);

          if (date.getDate() == today.getDate() &&
            date.getMonth() == today.getMonth() &&
            date.getFullYear() == today.getFullYear()) {
            $scope.HealthPoint = DailyHP[x].daily_points
          }
        }
        //getComplianceDataForWeek(complianceData);
        //getComplianceDataForMonth(complianceData, $scope.DATE)

      }, function (error) {
        console.log("getHealthPoint error")
      })

      //$scope.selectedView = 'day';
      //$scope.DayView = true;
      $scope.changeView(1);
    }
    init();


    function getChartConfigForDay(data, color1, color2) {
      if (data > 999) {
        data = 999;
      }
      if (data >= 100) {
        marker = 'circle'
      }
      else {
        marker = ''
      }
      var chartConfig = {
        options: {
          chart: {
            type: 'solidgauge',
            backgroundColor: 'transparent',
            height: 150,
            margin: [0, 0, 0, 0],
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0
          },
          title: null,
          //Hide highcharts link from bottom
          credits: {
            enabled: false
          },
          pane: {
            startAngle: 0,
            endAngle: 360,
            size: '70%',
            background: [{ // Track for Move
              outerRadius: '123%',
              innerRadius: '77%',
              backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.3).get(),
              borderWidth: 0
            }]
          },
          plotOptions: {
            solidgauge: {
              borderWidth: '14%',
              dataLabels: {
                enabled: true,
                y: -20,
                borderWidth: 0,
                useHTML: true
              },
              linecap: 'round',
              stickyTracking: false
            }
          },
        },
        yAxis: {
          min: 0,
          max: 100,
          lineWidth: 0,
          tickPositions: []
        },
        series: [{
          name: 'Move',
          borderColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
              /*[0, 'rgb(66, 153, 209)'],
              [1, 'rgb(31, 96, 164)']*/
              [0, color1],
              [1, color2]
            ]
          },
          data: [{
            color: {
              linearGradient: [0, 60, 60, 500],
              stops: [
                /*[0, 'rgb(66, 153, 209)'],
                [1, 'rgb(31, 96, 164)']*/
                [0, color1],
                [1, color2]
              ]
            },
            radius: '100%',
            innerRadius: '100%',
            y: utilityService.round(data, 1) // one number after decimal
          }],
          marker: {
            symbol: marker
          },
          dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:24px;font-weight:normal;color:' +
            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white') + '">{y}</span>' +
            '<span style="font-size:24px;color:white;font-weight:normal">%</span></div>'
          }
        }],

        func: function (chart) {
        }
      };
      return chartConfig;
    }


    function getChartConfigForWeek(dataGoal, dataAchived, dataExceed, colorcode, dates) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      var TstartDate = moment().utcOffset('-07:00').subtract(6, 'days').format('L');
      var startDate = moment(TstartDate)
      var TendDate = moment().utcOffset('-07:00').format('L');
      var endDate = moment(TendDate)

      var dateList = [];
      var tempDate = startDate;
      var i = 0;

      while (tempDate.diff(endDate) <= 0) {
        if (i == 0) {
          dateList.push(monthNames[startDate.month()] + " " + startDate.date())
          i++;
        }
        else {
          dateList.push(tempDate.date())
        }
        var Tdate = startDate.add(1, 'days').startOf('day').format('L');
        tempDate = moment(Tdate);
      }


      var chartConfig = {
        options: {
          chart: {
            type: 'column',
            backgroundColor: 'transparent',
            spacingLeft: 5,
            // Explicitly tell the width and height of a chart
            width: null,
            height: null
          },
          title: {
            text: '',
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
              }
            }
          },
          //Hide highcharts link from bottom
          credits: {
            enabled: false
          },
          //Make the legend invisible.[footer series labels]
          legend: {
            x: 9999,
            y: 9999
          },
        },
        //X axis data
        xAxis: {
          categories: dateList,
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          },
        },
        series: [{
          data: dataGoal,
          color: "#999999",
          //color: color,
          borderColor: 'transparent'
        }, {
          data: dataExceed,
          color: "#F3A81B",
          //color: color,
          borderColor: 'transparent'
        }, {
          data: dataAchived,
          color: colorcode,
          borderColor: 'transparent'
        }],
        func: function (chart) {
        }

      };
      return chartConfig;
    }


    function getChartConfigForMonth(dataGoal, dataAchived, dataExceed, colorcode, dates) {
      var chartConfig = {
        options: {
          chart: {
            type: 'column',
            backgroundColor: 'transparent',
            spacingLeft: 5,
            // Explicitly tell the width and height of a chart
            width: null,
            height: null
          },
          title: {
            text: '',
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: false,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
              }
            }
          },
          //Hide highcharts link from bottom
          credits: {
            enabled: false
          },
          //Make the legend invisible.[footer series labels]
          legend: {
            x: 9999,
            y: 9999
          },
        },
        //X axis data
        xAxis: {
          categories: dates,
        },
        yAxis: {
          min: 0,
          title: {
            text: ''
          },
        },
        series: [{
          data: dataGoal,
          color: "#999999",
          borderColor: 'transparent'
        }, {
          data: dataExceed,
          color: "#F3A81B",
          borderColor: 'transparent'
        }, {
          data: dataAchived,
          color: colorcode,
          borderColor: 'transparent'
        }],
        func: function (chart) {
        }

      };
      return chartConfig;
    }



    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    $scope.gotoAction = function (id) {
      if (id == 0) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);

        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }

    }

    // $scope.back = function () {
    //  console.log("BACK called==")
    //   console.log($ionicHistory.viewHistory());
    //   $ionicHistory.goBack();
    // }

  }])



  .controller('ExerciseLibraryCtrl', ['$rootScope', '$scope', 'sortedByList', '$ionicPopup', 'ExerciseLibraryService','$state','SetExerciseProgramService', function ($rootScope, $scope, sortedByList, $ionicPopup, ExerciseLibraryService,$state,SetExerciseProgramService) {
    console.log($stateParams);
    console.log($rootScope.UID)
    $scope.searchExercise;
    $scope.title = 'Exercise Program';
    $scope.subNavList = false;
    $scope.sortList = false;
    var exerciseListBackup;
    getListOfExerciseProgramme();

    var exerciseList = [];

    var exerciseSortedByList = [
      {
        id: 0,
        title: 'All'
      },
      {
        id: 1,
        title: 'Active'
      },
      {
        id: 2,
        title: 'Inactive'
      },
      {
        id: 3,
        title: 'Today'
      },
      {
        id: 4,
        title: 'Rest of the Week'
      }
    ];

    $scope.exerciseSortedByList = exerciseSortedByList;
    $scope.sortedBy = $scope.exerciseSortedByList[0].title;

    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }
    $scope.showListSortList = function () {
      $scope.sortList = !$scope.sortList;
    }

    $scope.sortPatients = function (sortType, title) {

      switch (sortType) {
        case 0:
          $scope.exerciseList = exerciseListBackup;
          $scope.sortedBy = title;
          break;
        case 1:
          $scope.exerciseList = exerciseListBackup;
          $scope.sortedBy = title;
          break;
        case 2:
          $scope.exerciseList = [];
          $scope.sortedBy = title;
          break;
        case 3:
          var todayExercise = [];
          var exerciseListForToday = exerciseListBackup;
          for (var i = 0; i < exerciseListForToday.length; i++) {
            if (exerciseListForToday[i].today === 1) {
              todayExercise.push(exerciseListForToday[i]);
            }
          }
          $scope.sortedBy = title;
          $scope.exerciseList = todayExercise;
          break;
        case 4:
          var restOfWeekExercise = [];
          var exerciseListForRestOfDay = exerciseListBackup;
          for (var i = 0; i < exerciseListForRestOfDay.length; i++) {
            if (exerciseListForRestOfDay[i].today === 0) {
              restOfWeekExercise.push(exerciseListForRestOfDay[i]);
            }
          }
          $scope.sortedBy = title;
          $scope.exerciseList = restOfWeekExercise;
          break;
        default:
          $scope.exerciseList = exerciseListBackup;
          break;
      }

      $scope.sortList = !$scope.sortList;
    }

    $scope.gotoAction = function (id) {
      if (id == 2) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }

    }

    $scope.sortedByList = sortedByList;
    //  $scope.sortedBy =  $scope.sortedByList[0].id;
    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }




    //This function is use to delete exercise belong to a patient.
    $scope.delete = function (peid, index) {
      console.log("Delete called")

      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete exercise',
        template: 'Are you sure you want to delete this exercise ?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          SetExerciseProgramService.deleteExercise($rootScope.loggedInUserUid, peid).then(function (success) {

            if (success.success == true) {
              $scope.exerciseList.splice(index, 1);
            }
            else {
              console.log("unable to delete");
              alert("Unable to delete the eercise ");
            }
          }, function (error) { })

        } else {
          console.log("cancel")
        }
      });


    }


    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }

    $scope.sortedByList = sortedByList;
    //  $scope.sortedBy =  $scope.sortedByList[0].id;
    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    $scope.gotoAction = function (id) {
      if (id == 2) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }

    }

    init = function () {
      console.log($stateParams.patientId)
    }
    init();

    var addPopup;

    $scope.addss = function () {

      addPopup = $ionicPopup.show({
        template: '<div style="font-weight:bold;"> <button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;">My Mobile Device</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;">My Library</button><button class="button button-block btn-yellow" style="color: #fff;font-weight:bold;" ng-click="newExercise()">Create New</button></div>',
        // template: '<div style="background: #121516; color: #fff;"> <button class="button button-block btn-yellow" style="background: #121516; color: #fff;">My Mobile Device</button><button class="button button-block btn-yellow">My Library</button><button class="button button-block btn-yellow">Create New</button></div>',
        title: 'Add Exercise',
        subTitle: 'Choose a Source',
        scope: $scope,
        buttons: [
          { text: 'Cancel' }
        ]
      });

    }

    $scope.newExercise = function () {
      addPopup.close();
      $state.transitionTo('setExerciseProgram', {}, { reload: true });
    }

    $scope.gotoHome = function () {
      if (addPopup != undefined || addPopup != null) {
        addPopup.close();
      }
      console.log("ExerciseProgramHome")
      $state.transitionTo('main.dash', {}, { reload: false });
    }


    function getListOfExerciseProgramme() {
      SetExerciseProgramService.listOfExercise($rootScope.UID).then(function (data) {
        $scope.exerciseList = data.exercises;
        exerciseListBackup = data.exercises;
      });
    }

    $scope.days = function (weekly) {
      var log = [];
      angular.forEach(weekly, function (value, key) {
        if (value === 1) {
          switch (key) {
            case "mon":
              this.push(1);
              break;
            case "tue":
              this.push(2);
              break;
            case "wed":
              this.push(3);
              break;
            case "thu":
              this.push(4);
              break;
            case "fri":
              this.push(5);
              break;
            case "sat":
              this.push(6);
              break;
            case "sun":
              this.push(7);
          }
        }

      }, log);

      log = log.sort(function (a, b) { return a - b });

      var arr = log;
      var result = '';
      var start, end;  // track start and end

      if (arr.length > 0) {
        end = start = arr[0];

        for (var i = 1; i < arr.length; i++) {
          // as long as entries are consecutive, move end forward
          if (arr[i] == (arr[i - 1] + 1)) {
            end = arr[i];

          }
          else {
            // when no longer consecutive, add group to result
            // depending on whether start=end (single item) or not
            if (start == end) {
              result += start + ",";
            }
            else {
              result += start + "-" + end + ",";
            }
            start = end = arr[i];
          }
        }

        // handle the final group
        if (start == end) {
          result += start;
        }
        else {
          result += start + "-" + end;
        }

        for (var x = 0; x < result.length; x++) // Convert string array to integer array
        {
          var str = result.charAt(x);
          switch (str) {
            case "2":
              result = result.replace("2", "T");
              break;
            case "3":
              result = result.replace("3", "W");
              break;
            case "4":
              result = result.replace("4", "T");
              break;
            case "5":
              result = result.replace("5", "F");
              break;
            case "6":
              result = result.replace("6", "S");
              break;
            case "7":
              result = result.replace("7", "S");
              break;
            case "1":
              result = result.replace("1", "M");
              break;
          }

        }
        return result;
      }
      else {
        result = "";
        return result;
      }

    }
    //  $scope.day;

    //         console.log($scope.exerciseList + 'inside controller'+day);

    //         day = ($scope.exerciseList.weekly.sun === 1) ?"S":"";
    //         day = ($scope.exerciseList.weekly.mon === 1) ?"M":"";
    //         day = ($scope.exerciseList.weekly.tue === 1) ?"T":"";
    //         day = ($scope.exerciseList.weekly.wed === 1) ?"W":"";
    //         day = ($scope.exerciseList.weekly.thu === 1) ?"T":"";
    //         day = ($scope.exerciseList.weekly.fri === 1) ?"F":"";
    //         day = ($scope.exerciseList.weekly.sat === 1) ?"S":"";


  }])

  .controller('paymentCtrl', ['$scope', '$stateParams', 'sortedByList', '$state', function ($scope, $stateParams, sortedByList, $state) {
    console.log($stateParams);

    $scope.patientProfile = {
      name: $stateParams.name,
      age: $stateParams.age,
      gender: $stateParams.gender,
      email: $stateParams.email,
      url: $stateParams.profile_url
    }
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;
    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }
    $scope.gotoAction = function (id) {
      var state = getStateTitle(id);

      $state.transitionTo(state, { name: $stateParams.name }, { reload: true });
    }


  }])

  .controller('ReviewSnapshotsCtrl', ['$scope', '$rootScope', 'Flash', '$ionicHistory', '$state', '$cordovaCamera', 'sortedByList', function ($scope, $rootScope, Flash, $ionicHistory, $state, $cordovaCamera, sortedByList) {

    $scope.title = 'Review Snapshots';
    $scope.subNavList = false;
    $scope.sortedByList = sortedByList;
    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
      console.log($scope.subNavList)
    }

    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }
    $scope.gotoAction = function (id) {
      if (id == 4) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, {}, { reload: true });
      }

    }

    var pageSize = 10;
    var reportsList = [
      {
        id: 0,
        title: "Report #1"
      },
      {
        id: 1,
        title: "Report #2"
      },
      {
        id: 2,
        title: "Report #3"
      },
      {
        id: 3,
        title: "Report #4"
      },
      {
        id: 4,
        title: "Report #5"
      },
      {
        id: 5,
        title: "Report #6"
      },
      {
        id: 6,
        title: "Report #7"
      },
      {
        id: 7,
        title: "Report #8"
      },
      {
        id: 8,
        title: "Report #9"
      },
      {
        id: 9,
        title: "Report #10"
      },
      {
        id: 10,
        title: "Report #11"
      },
      {
        id: 11,
        title: "Report #12"
      },
      {
        id: 12,
        title: "Report #13"
      },
      {
        id: 13,
        title: "Report #14"
      },
      {
        id: 14,
        title: "Report #15"
      },
      {
        id: 15,
        title: "Report #16"
      },
      {
        id: 16,
        title: "Report #17"
      },
      {
        id: 17,
        title: "Report #18"
      },
      {
        id: 18,
        title: "Report #19"
      },
      {
        id: 19,
        title: "Report #20"
      }
      /* {
         id: 20,
         title: "Report #21"
       }
   */
    ];

    $scope.pages = [
      {
        id: 0,
        title: "Page 1"
      },
      {
        id: 1,
        title: "Page 2"
      },
      {
        id: 2,
        title: "Page 3"
      },
      {
        id: 3,
        title: "Page 4"
      },
      {
        id: 4,
        title: "Page 5"
      }
    ];

    $scope.selectedPage = $scope.pages[0].id;

    $scope.showNext = function (pageNo) {

      var list = angular.copy(reportsList);
      var offset = (pageNo - 1) * pageSize;
      $scope.reportsList = list.splice(offset, pageSize);
      $scope.selectedPage = $scope.pages[pageNo - 1].id;
    }

    $scope.showNext(1);

    $scope.showPrevious = function (pageNo) {

      var list = angular.copy(reportsList);
      var offset = (pageNo + 1) * pageSize;
      $scope.reportsList = list.splice(offset, pageSize);
      $scope.selectedPage = $scope.pages[pageNo + 1].id;
    }

    $scope.showPrevious(-1);

    // $scope.back = function () {
    //   //alert("hiiii");
    //   $ionicHistory.goBack();
    //   console.log($ionicHistory.viewHistory());

    // }
  }])

  .controller('MessageCtrl', ['$scope', 'sortedByList', '$state', '$http', '$ionicPopup', 'ChatApp', '$timeout', '$stateParams', '$rootScope', 'AppService', '$ionicScrollDelegate', function ($scope, sortedByList, $state, $http, $ionicPopup, ChatApp, $timeout, $stateParams, $rootScope, AppService, $ionicScrollDelegate) {
    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var uid = $rootScope.loggedInUserUid;
    $scope.userImage = "img/profile_icon.png";
    $scope.toUserImage = "img/profile_icon.png";
    $scope.sortedByList = sortedByList;
    $scope.title = 'Messages';
    $scope.subNavList = false;
    if ($stateParams.uid == null || $stateParams.uid == undefined || $stateParams.uid == "") {
      $stateParams.uid = $rootScope.UID;
    } else {
      $rootScope.UID = $stateParams.uid;
      $rootScope.patientName = $stateParams.name
    }



    $scope.showList = function () {
      console.log($scope.subNavList)
      $scope.subNavList = !$scope.subNavList;
      console.log($scope.subNavList)
    }


    $scope.patientProfile = {
      name: $stateParams.name,
    }

    $scope.doctorProfile = {
      url: ''
    }

    init = function () {

      console.log($stateParams)

      AppService.profile($stateParams.uid).then(function (success) {
        patientData = success;
        if (patientData.image != "") {
          $scope.userImage = patientData.image;
          $scope.toUserImage = patientData.therapist_image;
        }

        //patient
        $scope.toUser = {
          _id: $stateParams.uid,
          pic: $scope.toUserImage,
          username: patientData.therapist_first_name
        };

        // this could be on $rootScope rather than in $stateParams
        //doctor
        $scope.user = {
          _id: uid,
          pic: $scope.userImage,
          username: patientData.first_name

        };


      }, function (error) {

      })

    }
    init();
    getMessages();

    //patient id
    //  $scope.toUser = {
    //     _id:  $stateParams.uid,
    //      pic: $scope.toUserImage,
    //     username: $stateParams.name
    //   };

    //    // this could be on $rootScope rather than in $stateParams
    //    //doctor
    //   $scope.user = {
    //     _id: uid,
    //     pic:$scope.userImage,
    //     username: 'Marty'
    //   };


    $scope.sendMessage = function () {

      var messageInput = $scope.input.message;
      $scope.input.message = '';

      // if (/\S/.test($scope.input.message)) {
      //   var data = {
      //     "message": messageInput
      //   };
      if (/\S/.test(messageInput)) {
        var data = {
          "message": messageInput
        };

        ChatApp.sendPatientMessage(data, $stateParams.uid, uid).then(function (success) {
          //  alert("success"+JSON.stringify(success));
          var message = {
            "message_id": success.message_id,
            "uid1": uid,
            "uid2": $stateParams.uid,
            //  "message": $scope.input.message,
            "message": messageInput,
            "timestamp": success.timestamp

          };

          $scope.messages.push(message);
          $timeout(function () {
            keepKeyboardOpen();
            viewScroll.scrollBottom(true);
          }, 0);


          //$scope.input.message = '';
          // $timeout(function () {
          //   //   $scope.messages.push(MockService.getMockMessage());
          //   keepKeyboardOpen();
          //   viewScroll.scrollBottom(true);
          // }, 2000);


        }, function (error) {
          $scope.input.message = messageInput;
        })
      }

    };

    function getMessages() {
      // the service is mock but you would probably pass the toUser's GUID here
      ChatApp.getUserMessages($rootScope.UID, uid).then(function (data) {
        $scope.doneLoading = true;
        $scope.messages = data;
        //   alert(JSON.stringify(data));

        $timeout(function () {
          viewScroll.scrollBottom();
        }, 0);
      });
    }

    // $scope.back = function () {
    //   console.log($ionicHistory.viewHistory());
    //   $ionicHistory.goBack();
    // }


    function keepKeyboardOpen() {
      console.log('keepKeyboardOpen');
      // txtInput.one('blur', function() {
      //   console.log('textarea blur, focus back on it');
      //   txtInput[0].focus();
      // });
    }

    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    $scope.gotoAction = function (id) {
      if (id == 6) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }

    }

    $scope.onMessageHold = function (event, index, message) {
      // the service is mock but you would probably pass the toUser's GUID here
      var data = {
        "id": index
      }

      AppService.onMessageHold(data, $rootScope.UID).then(
        function (success) {
          console.log("SUCCESS")
        },
        function (error) {
          console.log("ERROR");
        });
    }

  }])

  // fitlers
  .filter('nl2br', ['$filter',
    function ($filter) {
      return function (data) {
        if (!data) return data;
        return data.replace(/\n\r?/g, '<br />');
      };
    }
  ])

  .controller('VitalsCtrl', ['$scope', '$state', '$stateParams', 'sortedByList', '$ionicHistory', 'AppService', function ($scope, $state, $stateParams, sortedByList, $ionicHistory, AppService) {
    $scope.sortedByList = sortedByList;
    //$scope.sortedBy = $scope.sortedByList[5].id;
    $scope.selectedView = 'Today';
    $scope.DayView = true;
    $scope.title = 'Vitals';

    $scope.subNavList = false;

    $scope.showList = function () {
      $scope.subNavList = !$scope.subNavList;
    }

    $scope.patientProfile = {
      name: $stateParams.name,
      age: $stateParams.age,
      gender: $stateParams.gender,
      email: $stateParams.email,
      url: $stateParams.profile_url
    }

    init = function () {
      console.log($stateParams.patientId)
      AppService.getVitals($stateParams.patientId).then(function (success) {
        console.log("Vital Success")
        console.log(success)
      }, function (error) {
        console.log("error")
      })
    }

    $scope.changeView = function (view) {
      switch (view) {
        case 1:
          $scope.selectedView = 'Today';
          break;
        case 2:
          $scope.selectedView = 'Week';
          break;
        case 3:
          $scope.selectedView = 'Month';
          break;
        default:
          $scope.selectedView = 'Today';
      }

    }

    function getStateTitle(id) {
      var title = '';
      var list = $scope.sortedByList;
      for (var i = 0; i < list.length; i++) {
        if (id == list[i].id) {
          title = list[i].routingStateName;
          return title;
        }
      }
    }

    $scope.gotoAction = function (id) {
      if (id == 5) {
        $scope.subNavList = false
      } else {
        var state = getStateTitle(id);
        $state.transitionTo(state, { name: $stateParams.name, patientId: $stateParams.uid }, { reload: true });
      }
    }

    init();

  }]);
