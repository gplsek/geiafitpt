angular.module('geiaFitApp')

  .controller('AppCtrl', function ($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS, $ionicHistory) {
    $scope.username = AuthService.username();

    $scope.$on(AUTH_EVENTS.notAuthorized, function (event) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unauthorized!',
        template: 'You are not allowed to access this resource.'
      });
    });


    $scope.logout = function () {
      AuthService.logout();
      $state.transitionTo('login', {}, { reload: true });
    };



    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
      AuthService.logout();
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




  })

  .controller('LoginCtrl', ['$scope', '$state', '$ionicPopup', 'AuthService', 'Flash', '$rootScope', function ($scope, $state, $ionicPopup, AuthService, Flash, $rootScope) {

  $scope.data = {
    email: "",
    password: ""
  };

    function checkEmptyFields() {
      var isEmpty = false;
      for (var property in $scope.data) {
        if ($scope.data.hasOwnProperty(property)) {
          if (!$scope.data[property]) {
            isEmpty = true;
          }
        }
      }
      return isEmpty;
    }

    function checkEmail(email) {
      console.log(email);
      var result = false;
      var pattern = $rootScope.Regex.email;
      result = pattern.test(email);
      return result;
    }

    $scope.login = function (data) {
      if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
        if (!checkEmptyFields()) {
          // alert(data.email);
          if (checkEmail(data.email)) {
            AuthService.login(data.email, data.password, data.checked).then(function (authenticated) {
              Flash.showFlash({ type: 'success', message: "Success !" });
              $state.go('main.dash', {}, { reload: true });
              $scope.setCurrentUsername(data.username);
            }, function (err) {
              Flash.showFlash({ type: 'error', message: "Login Failed !" });
            });
          } else {
            Flash.showFlash({ type: 'error', message: "Email is not valid !" });
          }
        }
        else {
          Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        }
      } else {
        Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
      }
    }

    //   $scope.login = function(data) {
    //     $scope.data = {};
    //     if(!data){
    //       var alertPopup = $ionicPopup.alert({
    //         title: 'Login failed!',
    //         template: 'Please check your credentials!'
    //       });
    //       return
    //     }
    //       AuthService.login(data.username, data.password,data.checked).then(function(authenticated) {
    //       $state.go('main.dash', {}, {reload: true});
    //       $scope.setCurrentUsername(data.username);
    //     }, function(err) {
    //       var alertPopup = $ionicPopup.alert({
    //         title: 'Login failed!',
    //         template: 'Please check your credentials!'
    //       });
    //     });
    //   };


  }])
  .controller('DashboardCtrl', function ($scope, $state, $http, $ionicPopup, AuthService, patientsData) {
    // var keepsignedin = window.localstorage ? window.localstorage.getItem('KEEP_SIGNED_IN'): "";
    //  if(keepsignedin){
    //    $state.go('main.dash');
    //  }
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
          break;
        case 1:
          $scope.sortType = 'emotion';
          $scope.sortOrder = true;
          break;
        case 2:
        case 3:
        default:
          $scope.sortType = 'unread_messages';
          $scope.sortOrder = true;
          break;
      }
    }

  })

  .controller('SetExerciseProgramCtrl', ['$scope', '$state', '$stateParams', 'sortedByList', function ($scope, $state, $stateParams, sortedByList) {
    $scope.uid = $stateParams.uid;
    $scope.patientData = $stateParams.name;
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[2].id;
    console.log(sortedByList);

    $scope.closePatient = function () {

      $state.go('exerciseProgram');
    }
  }])

  .controller('SetActivityGoalsCtrl', ['$scope', '$state', 'sortedByList', '$ionicHistory', 'threshold', '$window', '$stateParams', function ($scope, $state, sortedByList, $ionicHistory, threshold, $window, $stateParams) {
    $scope.setActivityGoals = {};
    /* $scope.activityGoals = {
       selectedSteps : '',
       lightMinsSelected:'',
       moderateMinsSelected:'',
       vigorousMinsSelected:'',
       instructions:'',
     };*/
    $scope.patientData = $stateParams.name;
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[2].id;
    console.log(threshold);

    $scope.threshold = threshold;

    $scope.slider = {
      min: 40,
      max: 220,
      options: {
        floor: 40,
        ceil: 220
      }
    };
    $scope.slider2 = {
      min: 40,
      max: 160,
      options: {
        floor: 40,
        ceil: 160
      }
    }
    $scope.$on("slideEnded", function () {
      // user finished sliding a handle
      console.log($scope.slider.min + 'slider max: ' + $scope.slider.max);
    });
    // $scope.stepsPerMinVal = threshold.steps_min;
    // $scope.heartRatePerminVal  = 0;

    // var mainSectionWidth = ($window.innerWidth - 30);
    // $scope.optimumBarlength =  Number(threshold.steps_high) - Number(threshold.steps_low);
    // $scope.highThreshBar = mainSectionWidth - Number(threshold.steps_high);

    // //for heart rate 
    // $scope.optimumHeartBarLength = Number(threshold.hr_high) - Number(threshold.hr_low); 
    // $scope.highHeartRateBar = mainSectionWidth - Number(threshold.hr_high);

    // $scope.lowThreshIndicator = Number(threshold.steps_low) - (35/2);  // 35 is the width of the popover
    // $scope.highThreshIndicator = Number(threshold.steps_low) + $scope.optimumBarlength - (35/2);

    // $scope.lowHeartRateIndicator = Number(threshold.hr_low) - (35/2);
    // $scope.highHeartRateIndicator = Number(threshold.hr_low) + $scope.optimumHeartBarLength - (35/2);


    /*  $scope.back = function(){
        $ionicHistory.goBack();
      }*/

    $scope.back = function () {
      console.log($ionicHistory.viewHistory());
      $ionicHistory.goBack();
    }

    var stepList = [];

    (function steps() {
      var value = 0;
      for (var i = 1; i <= 40; i++) {
        stepList.push({ id: i, steps: value + 500 });
        value += 500;
      }
      console.log(stepList);
    })();

    $scope.stepsList = stepList;

    $scope.selectedSteps = $scope.stepsList[0].id;

    $scope.myFunc = function () {
      console.log($scope.stepspermin);
    }
    var minsArray = [];

    (function mins() {
      for (var i = 1; i <= 180; i++) {
        minsArray.push({ id: i, title: i + " mins" });
      }
    })();


    $scope.lightMins = minsArray;
    $scope.lightMinsSelected = $scope.lightMins[0].id;


    $scope.moderateMins = minsArray;

    $scope.moderateMinsSelected = $scope.moderateMins[0].id;

    $scope.vigorousMins = minsArray;
    $scope.vigorousMinsSelected = $scope.vigorousMins[0].id;


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

    /*$scope.setActivityGoals = function(data){
        console.log($scope.activityGoals)
        console.log(data)
    }  */


  }])
  .controller('AddPatientCtrl', ['$scope', '$rootScope', 'Flash', '$ionicHistory', '$state', 'AppService',
    function ($scope, $rootScope, Flash, $ionicHistory, $state, AppService) {
      /*$scope.data = {
        patientName: "",
        email: "",
        subscription: ""
      };*/
      $scope.data = {
        email: "",
        firstname: "",
        lastname: "",
      };

      function checkEmptyFields() {
        var isEmpty = false;
        for (var property in $scope.data) {
          if ($scope.data.hasOwnProperty(property)) {
            if (!$scope.data[property]) {
              isEmpty = true;
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

      $scope.addPatient = function (data) {

        if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
          if (!checkEmptyFields()) {
            if (checkEmail(data.email)) {
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
            } else {
              Flash.showFlash({ type: 'error', message: "Email is not valid !" });
            }
          }
          else {
            Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
          }
        } else {
          Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        }
      }

    }])

  .controller('ExerciseLibraryCtrl', ['$scope', 'sortedByList', '$ionicPopup', 'ExerciseLibraryService', function ($scope, sortedByList, $ionicPopup, ExerciseLibraryService) {

  var pageSize = 10;
  $scope.pages = [];
  $scope.webExPages = [];
 // $scope.filterPatient = 'yes';
 
    init = function(){
      
      $scope.sortedByList = sortedByList;
      $scope.sortedBy = $scope.sortedByList[0].id;
      $scope.selectedTab = 'My Exercises';
      $scope.exerciseView = true;
      $scope.webExView = false;
      $scope.tempWebExList = "";

      

      var myExerciseList = [];
      var webExerciseList = [];
      var exerciseList = ExerciseLibraryService.exerciseData().then(function (success) {
        var exerciseData = success;
        for (i in exerciseData.exercises) {
          if (exerciseData.exercises[i].webex == '1') {
            webExerciseList.push(exerciseData.exercises[i]);
          }
          else {
            myExerciseList.push(exerciseData.exercises[i]);
          }
        }
        $scope.exerciseList = myExerciseList
        
        $scope.webExercise = webExerciseList
        $scope.tempWebExList = webExerciseList;
        console.log(webExerciseList)
        
        var myExercisePages = Math.ceil(myExerciseList.length / pageSize);
        $scope.webExercisePages = Math.ceil(webExerciseList.length  / pageSize);

        console.log(myExerciseList.length +""+ myExercisePages);
        console.log(webExerciseList.length +""+ $scope.webExercisePages);

        for(i=0;i<myExercisePages;i++){
            var page = {
                id : i+1,
                title : "page "+(i+1)
              }
              $scope.pages.push(page);
        }

        for(i=0;i<$scope.webExercisePages;i++){
            var page = {
                id : i+1,
                title : "page "+(i+1)
              }
              $scope.webExPages.push(page);
        }


        $scope.selectedPage = $scope.pages[0].id;
        $scope.showNext(1);
      },function(error){


      })

    }
    init();

    $scope.getFilteredData = function(){
      
    }

    // function to tab between MyExercise and Web Exercise.
    $scope.changeView = function (view) {
      this.filterPatient = '';
      switch (view) {
        case 1:
          $scope.selectedTab = 'My Exercises';
          $scope.webExView = false;
          $scope.exerciseView = true;
          
          break;
        case 2:
          $scope.selectedTab = 'WebEx Exercises';
          $scope.webExView = true;
          $scope.exerciseView = false;
          
          break;
        default:
          $scope.selectedTab = 'My Exercises';
          $scope.exerciseView = true;
          
      }

    }


    $scope.data = {
      model: null,
      availableOptions: [

        { id: '1', name: 'Exercise Name' },
        { id: '2', name: 'Category' },
        { id: '3', name: 'Upper Extremity' },
        { id: '4', name: 'Shoulder' },
        { id: '5', name: 'Elbow' },
        { id: '6', name: 'Wrist' },
        { id: '7', name: 'Hand' },
        { id: '8', name: 'Lower Extemity' },
        { id: '9', name: 'Hip' },
        { id: '10', name: 'Knee' },
        { id: '11', name: 'Foot' }
      ]
    };




    var exerciseList = [
      {
        id: 0,
        title: "Exercise 1"
      },
      {
        id: 1,
        title: "Exercise 2"
      },
      {
        id: 2,
        title: "Exercise 3"
      },
      {
        id: 3,
        title: "Exercise 4"
      },
      {
        id: 4,
        title: "Exercise 5"
      },
      {
        id: 5,
        title: "Exercise 6"
      },
      {
        id: 6,
        title: "Exercise 7"
      },
      {
        id: 7,
        title: "Exercise 8"
      },
      {
        id: 8,
        title: "Exercise 9"
      },
      {
        id: 9,
        title: "Exercise 10"
      },
      {
        id: 10,
        title: "Exercise 11"
      }
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

    $scope.showNext = function (pageNo,flag) {
      var list = angular.copy($scope.tempWebExList);
      var offset = (pageNo - 1) * pageSize;
      $scope.webExercise = list.splice(offset, pageSize);
      if(flag==1){
        $scope.selectedPage = $scope.webExPages[pageNo - 1].id;
      }else{
        $scope.selectedPage = $scope.selectedPage + 1; 
      }
      
      console.log($scope.selectedPage)
      console.log($scope.webExercisePages)
    }
    

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
  .controller('AddExerciseCtrl', ['$scope', function ($scope) {


  }])
  .controller('AddExercisePopupCtrl', ['$scope', '$state', function ($scope, $state) {

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

    $scope.showCP = false;
    // $scope.profile = profileData;
    $scope.editEnabled = false;

    $scope.testFunction= function(file){
      console.log(file)
      var fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = function (e) {
      var dataUrl = e.target.result;
      var base64Data = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);

      var data = {
        image_name : file.$ngfName, 
        image : base64Data
      }

        MyAccount.uploadImage(data).then(function(success){
          console.log(success)
        },function(error){
          console.log(error)
        })

    };

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
    function checkEmptyFields() {
      var isEmpty = false;
      var data = data;
      for (var property in data) {
        if (data.hasOwnProperty(property)) {
          if (!data[property]) {
            isEmpty = true;
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
        if (!checkEmptyFields()) {

          if (checkEmail(data.email)) {
            Flash.showFlash({ type: 'success', message: "Success !" });
          } else {
            Flash.showFlash({ type: 'error', message: "Email is not valid !" });
          }
        }
        else {
          Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
        }
      } else {
        Flash.showFlash({ type: 'error', message: "Please fill in all fields !" });
      }
    }



  }])


  .controller('ActivityCtrl', ['$scope', '$stateParams', 'sortedByList', '$state', 'AppService', 'utilityService', function ($scope, $stateParams, sortedByList, $state, AppService, utilityService) {
    var patientData;
    var ActivityData;
    var activityDataForWeek = [];
    var activityDataForMonth = [];
    var activityDataForYesterday = '';
    var monthList = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    getActivityDataForYesterday = function (successData) {
      var startDate = new Date("Sun Sep 25 2016 17:04:28 GMT+0530 (IST)");
      var date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1,
        startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds())

      for (var x in successData) {
        var unixDate = successData[x].date
        var newDate = utilityService.unixTimeToDate(unixDate);
        if (date.getDate() === newDate.getDate() && date.getFullYear() === newDate.getFullYear() && date.getMonth() === newDate.getMonth()) {
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
        stepsPer = ( achieved/goal ) * 100;
      }
      if (activityDataForYesterday.time_active_low != null && activityDataForYesterday.time_active_low_goal != null) {
        var goal = activityDataForYesterday.time_active_low_goal;
        var achieved = activityDataForYesterday.time_active_low ;
        $scope.DayLowDone = achieved;
        $scope.DayLowGoal = goal;
        lowPer = ( achieved/goal ) * 100;
      }
      if (activityDataForYesterday.time_active_medium != null && activityDataForYesterday.time_active_medium_goal != null) {
        var goal = activityDataForYesterday.time_active_medium_goal;
        var achieved = activityDataForYesterday.time_active_medium;
        $scope.DayMidDone = achieved;
        $scope.DayMidGoal = goal;
        mediumPer = ( achieved/goal ) * 100;
      }
      if (activityDataForYesterday.time_active_high != null && activityDataForYesterday.time_active_high_goal != null) {
        var goal = activityDataForYesterday.time_active_high_goal;
        var achieved = activityDataForYesterday.time_active_high;
        $scope.DayHighDone = achieved;
        $scope.DayHighGoal = goal;
        highPer = ( achieved/goal ) * 100;
      }

      console.log('excPer ' + excPer);
      console.log('stepsPer ' + stepsPer);
      console.log('lowPer ' + lowPer);
      console.log('mediumPer ' + mediumPer);
      console.log('highPer ' + highPer);
      $scope.chartConfig = getChartConfigForDay(excPer);
      $scope.chartConfig1 = getChartConfigForDay(stepsPer);
      $scope.chartConfig2 = getChartConfigForDay(lowPer);
      $scope.chartConfig3 = getChartConfigForDay(mediumPer);
      $scope.chartConfig4 = getChartConfigForDay(highPer);
    }


    getActivityDataForWeek = function (successData) {
      
      var startDate = new Date();
      var endDate = new Date(startDate.getFullYear(), startDate.getMonth() , startDate.getDate()-7,
        startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds())

      for (var x in successData) {
        var unixDate = successData[x].date
        var date = utilityService.unixTimeToDate(unixDate);
        if (startDate > date && date > endDate) {
          activityDataForWeek.push(successData[x]);
        }
      }
      console.log(activityDataForWeek)
    }

    getWeekDates = function () {
      var endDate = new Date();
      var startDate = new Date(endDate.getFullYear(), endDate.getMonth() , endDate.getDate()-7,
        endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds())
      var dateList = [];
      var date = startDate;
      while (date < endDate) {
        dateList.push(date)
        var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1,
          date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
        date = tempDate;
      }
      return dateList;
    }

    chartConfigForWeek = function () {
      var dataWeekExerciseGoal = [];
      var dataWeekStepsGoal = [];
      var dataWeekLightGoal = [];
      var dataWeekModerateGoal = [];
      var dataWeekVigorousGoal = [];
      var dataWeekComplianceGoal = [];

      var dataWeekExercise = [];
      var dataWeekSteps = [];
      var dataWeekLight = [];
      var dataWeekModerate = [];
      var dataWeekVigorous = [];
      var dataWeekCompliance = [];

      var totalWeekExe =0;
      var totalWeekSteps =0;
      var totalWeekLow =0;
      var totalWeekMid =0;
      var totalWeekHigh =0;


      var dates = getWeekDates();

      for (var d in dates) {
        var total_exercise_goal = 0
        var total_exercise = 0
        var total_steps_goal = 0
        var total_steps = 0
        var time_active_low_goal = 0
        var time_active_low = 0
        var time_active_medium_goal = 0
        var time_active_medium = 0
        var time_active_high_goal = 0
        var time_active_high = 0
        var total_compliance_goal = 0 //TO DO
        var total_compliance = 0 //TO DO 

        for (var x in activityDataForWeek) {
          var tempDate = utilityService.unixTimeToDate(activityDataForWeek[x].date);
          if (tempDate.getFullYear() === dates[d].getFullYear() &&
            tempDate.getMonth() === dates[d].getMonth() &&
            tempDate.getDate() === dates[d].getDate()) {
            var temp = activityDataForWeek[x];

            if (temp.total_exercise_goal != null && total_exercise != null) {
              total_exercise_goal = parseInt(temp.total_exercise_goal)
              total_exercise = parseInt(temp.total_exercise)
            }

            if (temp.total_steps_goal != null && total_steps != null) {
              total_steps_goal = parseInt(temp.total_steps_goal)
              total_steps = parseInt(temp.total_steps)
            }

            if (temp.time_active_low_goal != null && time_active_low != null) {
              time_active_low_goal = parseInt(temp.time_active_low_goal)
              time_active_low = parseInt(temp.time_active_low)
            }

            if (temp.time_active_medium_goal != null && time_active_medium != null) {
              time_active_medium_goal = parseInt(temp.time_active_medium_goal)
              time_active_medium = parseInt(temp.time_active_medium)
            }

            if (temp.time_active_high_goal != null && time_active_high != null) {
              time_active_high_goal = parseInt(temp.time_active_high_goal)
              time_active_high = parseInt(temp.time_active_high)
            }

            if (temp.total_exercise_goal != null && total_exercise != null) {
              total_compliance_goal = parseInt(temp.total_exercise_goal) //TO DO
              total_compliance = parseInt(temp.total_exercise)  //TO DO
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
        dataWeekComplianceGoal.push(total_compliance_goal);

        dataWeekExercise.push(total_exercise);
        dataWeekSteps.push(total_steps);
        dataWeekLight.push(time_active_low);
        dataWeekModerate.push(time_active_medium);
        dataWeekVigorous.push(time_active_high);
        dataWeekCompliance.push(total_compliance);
      }

      $scope.totalWeekExe = (totalWeekExe == null) ? 0 : totalWeekExe;
      $scope.totalWeekSteps = (totalWeekSteps == null) ? 0 : totalWeekSteps;
      $scope.totalWeekLow = (totalWeekLow == null) ? 0 : totalWeekLow;
      $scope.totalWeekMid = (totalWeekMid == null) ? 0 : totalWeekMid;
      $scope.totalWeekHigh = (totalWeekHigh == null) ? 0 : totalWeekHigh;

      $scope.chartConfigWeekViewExercise = getChartConfigForWeek(dataWeekExerciseGoal, dataWeekExercise)
      $scope.chartConfigWeekViewSteps = getChartConfigForWeek(dataWeekStepsGoal, dataWeekSteps)
      $scope.chartConfigWeekViewLow = getChartConfigForWeek(dataWeekLightGoal, dataWeekLight)
      $scope.chartConfigWeekViewMid = getChartConfigForWeek(dataWeekModerateGoal, dataWeekModerate)
      $scope.chartConfigWeekViewHigh = getChartConfigForWeek(dataWeekVigorousGoal, dataWeekVigorous)
      $scope.chartConfigWeekViewComp = getChartConfigForWeek(dataWeekComplianceGoal, dataWeekCompliance)

    }

    getActivityDataForMonth = function (successData, dateForView) {
      var startDate
      if(dateForView == null){
        startDate = new Date();
      }
      else{
        startDate = dateForView;
      }
      var endDate = new Date(startDate.getFullYear(), startDate.getMonth(),1)

      for (var x in successData) {
        var unixDate = successData[x].date
        var date = utilityService.unixTimeToDate(unixDate);
        if (startDate > date && date > endDate) {
          activityDataForMonth.push(successData[x]);
        }
      }
    }

    getMonthDates = function (date) {
      var year = date.getFullYear()
      var month = date.getMonth()
      var date = date.getDate()
      var dateList = [];

      var d = new Date(year, month, date);
      var dateList = [];
      while (d.getMonth() === month) {
        var date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        dateList.push(date)
        d.setDate(d.getDate() - 1);
      }
      return dateList;
    }

    chartConfigForMonth = function () {
      var dataMonthExerciseGoal = [];
      var dataMonthStepsGoal = [];
      var dataMonthLightGoal = [];
      var dataMonthModerateGoal = [];
      var dataMonthVigorousGoal = [];
      var dataMonthComplianceGoal = [];

      var dataMonthExercise = [];
      var dataMonthSteps = [];
      var dataMonthLight = [];
      var dataMonthModerate = [];
      var dataMonthVigorous = [];
      var dataMonthCompliance = [];

      var totalMonthExe =0;
      var totalMonthSteps =0;
      var totalMonthLow =0;
      var totalMonthMid =0;
      var totalMonthHigh =0;

      var dates = getMonthDates($scope.DATE);
      var onlyDates = [] 
      for (var d in dates) {
        onlyDates.push(dates[d].getDate())

        var total_exercise_goal = 0
        var total_exercise = 0
        var total_steps_goal = 0
        var total_steps = 0
        var time_active_low_goal = 0
        var time_active_low = 0
        var time_active_medium_goal = 0
        var time_active_medium = 0
        var time_active_high_goal = 0
        var time_active_high = 0
        var total_compliance_goal = 0 //TO DO
        var total_compliance = 0 //TO DO 

        for (var x in activityDataForMonth) {
          var tempDate = utilityService.unixTimeToDate(activityDataForMonth[x].date);
          if (tempDate.getFullYear() === dates[d].getFullYear() &&
            tempDate.getMonth() === dates[d].getMonth() &&
            tempDate.getDate() === dates[d].getDate()) {
            var temp = activityDataForMonth[x];

             if (temp.total_exercise_goal != null && total_exercise != null) {
              total_exercise_goal = parseInt(temp.total_exercise_goal)
              total_exercise = parseInt(temp.total_exercise)
            }

            if (temp.total_steps_goal != null && total_steps != null) {
              total_steps_goal = parseInt(temp.total_steps_goal)
              total_steps = parseInt(temp.total_steps)
            }

            if (temp.time_active_low_goal != null && time_active_low != null) {
              time_active_low_goal = parseInt(temp.time_active_low_goal)
              time_active_low = parseInt(temp.time_active_low)
            }

            if (temp.time_active_medium_goal != null && time_active_medium != null) {
              time_active_medium_goal = parseInt(temp.time_active_medium_goal)
              time_active_medium = parseInt(temp.time_active_medium)
            }

            if (temp.time_active_high_goal != null && time_active_high != null) {
              time_active_high_goal = parseInt(temp.time_active_high_goal)
              time_active_high = parseInt(temp.time_active_high)
            }

            if (temp.total_exercise_goal != null && total_exercise != null) {
              total_compliance_goal = parseInt(temp.total_exercise_goal) //TO DO
              total_compliance = parseInt(temp.total_exercise)  //TO DO
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
        dataMonthComplianceGoal.push(total_compliance_goal);

        dataMonthExercise.push(total_exercise);
        dataMonthSteps.push(total_steps);
        dataMonthLight.push(time_active_low);
        dataMonthModerate.push(time_active_medium);
        dataMonthVigorous.push(time_active_high);
        dataMonthCompliance.push(total_compliance);
      }

      $scope.totalMonthExe = (totalMonthExe == null) ? 0 : totalMonthExe;
      $scope.totalMonthSteps = (totalMonthSteps == null) ? 0 : totalMonthSteps;
      $scope.totalMonthLow = (totalMonthLow == null) ? 0 : totalMonthLow;
      $scope.totalMonthMid = (totalMonthMid == null) ? 0 : totalMonthMid;
      $scope.totalMonthHigh = (totalMonthHigh == null) ? 0 : totalMonthHigh;
      $scope.lastDateOfMonth =  Math.max(...onlyDates);

       dataMonthExerciseGoal.reverse();
       dataMonthStepsGoal.reverse();
       dataMonthLightGoal.reverse();
       dataMonthModerateGoal.reverse();
       dataMonthVigorousGoal.reverse();
       dataMonthComplianceGoal.reverse();

       dataMonthExercise.reverse();
       dataMonthSteps.reverse();
       dataMonthLight.reverse();
       dataMonthModerate.reverse();
       dataMonthVigorous.reverse();
       dataMonthCompliance.reverse();

       onlyDates.reverse();


      $scope.chartConfigMonthViewExercise = getChartConfigForMonth(dataMonthExerciseGoal, dataMonthExercise,onlyDates)
      $scope.chartConfigMonthViewSteps = getChartConfigForMonth(dataMonthStepsGoal, dataMonthSteps,onlyDates)
      $scope.chartConfigMonthViewLow = getChartConfigForMonth(dataMonthLightGoal, dataMonthLight,onlyDates)
      $scope.chartConfigMonthViewMid = getChartConfigForMonth(dataMonthModerateGoal, dataMonthModerate,onlyDates)
      $scope.chartConfigMonthViewHigh = getChartConfigForMonth(dataMonthVigorousGoal, dataMonthVigorous,onlyDates)
      $scope.chartConfigMonthViewComp = getChartConfigForMonth(dataMonthComplianceGoal, dataMonthCompliance,onlyDates)

    }

    $scope.prevDate = function(){
      var d = $scope.DATE;
      var tempDate = new Date(d.getFullYear(), d.getMonth()-1,1)
      $scope.DATE = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
      console.log("Perv Selected "+$scope.DATE)
      getActivityDataForMonth(ActivityData,$scope.DATE) 
      chartConfigForMonth(); 
    }

    $scope.nextDate = function(){
      var d = $scope.DATE;
      var tempDate = new Date(d.getFullYear(), d.getMonth()+1,1)
      $scope.DATE = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
      console.log("Next Selected "+$scope.DATE)
      getActivityDataForMonth(ActivityData,$scope.DATE)
      chartConfigForMonth();  
    }

    init = function () {
      var d = new Date();
      $scope.DATE = new Date(d.getFullYear(),d.getMonth(),d.getDate());

      AppService.profile($stateParams.uid).then(function (success) {
        var imageUrl;
        var gender;
        patientData = success;

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

        if (patientData.gender == '2'){
          gender = "male";
        }else
        if(patientData.gender == '1'){
          gender = "female";
        }else{
          gender = "N/A";
        }

        $scope.patientProfile = {
          name: $stateParams.name,
          age: age,
          gender: gender,
          email: patientData.email,
          url: imageUrl
        }
      }, function (error) {

      })

      AppService.getActivity($stateParams.uid).then(function (success) {
        console.log("getActivity Success")
        ActivityData = success;
        getActivityDataForYesterday(success);
        getActivityDataForWeek(success);
        getActivityDataForMonth(success);
      }, function (error) {
        console.log("getActivity error")
      })
    }
    init();



    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;
    $scope.selectedView = 'day';
    $scope.DayView = true;

    $scope.changeView = function (view) {
      switch (view) {
        case 1:
          $scope.selectedView = 'day';
          $scope.DayView = true;
          $scope.WeekView = false;
          $scope.MonthView = false;
          chartConfigForDay();
          break;
        case 2:
          $scope.selectedView = 'week';
          $scope.WeekView = true;
          $scope.DayView = false;
          $scope.MonthView = false;
          chartConfigForWeek();
          break;
        case 3:
          $scope.selectedView = 'month';
          $scope.MonthView = true;
          $scope.DayView = false;
          $scope.WeekView = false;
          var d = new Date();
          $scope.DATE = new Date(d.getFullYear(),d.getMonth(),d.getDate());
          chartConfigForMonth();
          break;
        default:
          $scope.selectedView = 'day';
          $scope.DayView = true;
          $scope.WeekView = false;
          $scope.MonthView = false;
          chartConfigForDay();

      }

    }


    function getChartConfigForDay(data) {
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
              outerRadius: '112%',
              innerRadius: '88%',
              backgroundColor: "yellow",
              borderWidth: 0
            }]
          },
          plotOptions: {
            solidgauge: {
              borderWidth: '7%',
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
            borderColor: "green",
            data: [{
              color: "green",
              radius: '100%',
              innerRadius: '100%',
              y: data
            }],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'red') + '">{y}</span>' +
                       '<span style="font-size:25px;color:red">%</span></div>'
            }
          }],
        /*size: {
          width: 200,
          height: 180
        },*/
        func: function (chart) {
        }
      };
      return chartConfig;
    }


    function getChartConfigForWeek(dataGoal, dataAchived) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      var endDate = new Date();
      var startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7,
        endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds())
      var dateList = [];
      var date = startDate;
      var i = 0;
      while (date < endDate) {
        if(i == 0){
          dateList.push(monthNames[date.getMonth()]+" "+date.getDate())
          i++;
        }
        else{
          dateList.push(date.getDate())
        }
        var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1,
          date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
        date = tempDate;
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
          color: "yellow",
        }, {
            data: dataAchived,
            color: "blue",
          }],
        func: function (chart) {
        }

      };
      return chartConfig;
    }


    function getChartConfigForMonth(dataGoal, dataAchived, dates) {
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
          color: "yellow",
        }, {
            data: dataAchived,
            color: "blue",
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
      var state = getStateTitle(id);

      $state.transitionTo(state, { name: $stateParams.name }, { reload: true });
    }

  }])



  .controller('ExerciseProgramCtrl', ['$scope', '$stateParams', 'sortedByList', '$state', '$ionicPopup', function ($scope, $stateParams, sortedByList, $state, $ionicPopup) {
    console.log($stateParams);



    var pageSize = 10;
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;

    var exerciseList = [
      {
        id: 0,
        title: "Exercise Name"
      },
      {
        id: 1,
        title: "Exercise Name"
      },
      {
        id: 2,
        title: "Exercise Name"
      },
      {
        id: 3,
        title: "Exercise Name"
      },
      {
        id: 4,
        title: "Exercise Name"
      },
      {
        id: 5,
        title: "Exercise Name"
      },
      {
        id: 6,
        title: "Exercise Name"
      },
      {
        id: 7,
        title: "Exercise Name"
      },
      {
        id: 8,
        title: "Exercise Name"
      },
      {
        id: 9,
        title: "Exercise Name"
      },
      {
        id: 10,
        title: "Exercise Name"
      }

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
      var list = angular.copy(exerciseList);
      var offset = (pageNo - 1) * pageSize;
      $scope.exerciseList = list.splice(offset, pageSize);
      $scope.selectedPage = $scope.pages[pageNo - 1].id;
    }

    //];

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
      var list = angular.copy(exerciseList);
      var offset = (pageNo - 1) * pageSize;
      $scope.exerciseList = list.splice(offset, pageSize);
      $scope.selectedPage = $scope.pages[pageNo - 1].id;
    }

    $scope.showNext(1);

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


    /*
     $scope.sortedByList = sortedByList;
      $scope.sortedBy =  $scope.sortedByList[0].id;
      function getStateTitle(id){
        var title = '';
        var list = $scope.sortedByList;
        for(var i = 0; i < list.length; i++){
          if(id == list[i].id){
            title = list[i].routingStateName;
            return title;
          }
        
          $scope.gotoAction= function(id){
            var state = getStateTitle(id);
        
            $state.transitionTo(state,{name: $stateParams.name}, {reload: true});
          }
        */
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

  .controller('ReviewSnapshotsCtrl', ['$scope', '$rootScope', 'Flash', '$ionicHistory', '$state', '$cordovaCamera', function ($scope, $rootScope, Flash, $ionicHistory, $state, $cordovaCamera) {





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

    $scope.back = function () {
      //alert("hiiii");
      $ionicHistory.goBack();
      console.log($ionicHistory.viewHistory());

    }
  }])

.controller('MessageCtrl', function($scope, $state, $http, $ionicPopup, ChatApp,$timeout,$stateParams,$rootScope,
AppService,$ionicScrollDelegate)
 {
  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  var uid = $rootScope.loggedInUserUid;
   $scope.userImage="img/profile_icon.png";
   $scope.toUserImage="img/profile_icon.png";

   $scope.patientProfile = {
      name: $stateParams.name,
    }

    $scope.doctorProfile = {
          url: ''
        }
  
   init = function () {

      AppService.profile($stateParams.uid).then(function (success) {
        patientData = success;
        if (patientData.image != "") {
          $scope.userImage = patientData.image;
          $scope.toUserImage= patientData.therapist_image;
        }

      //patient
      $scope.toUser = {
      _id:  $stateParams.uid,
       pic: $scope.toUserImage,
      username: patientData.therapist_first_name
    };

     // this could be on $rootScope rather than in $stateParams
     //doctor
    $scope.user = {
      _id: uid,
      pic:$scope.userImage,
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
 

   $scope.sendMessage = function() {
    
   // alert("Sendmessage"+$scope.input.message);
    var data ={ 
    "message": $scope.input.message,
    "ptid":"1" //$stateParams.uid
    };
  
  ChatApp.sendPatientMessage(data,$stateParams.uid).then(function(success){
       //  alert("success"+JSON.stringify(success));
var message ={
"message_id": success.message_id,
"uid1": $stateParams.uid,
"uid2": uid,
"message":  $scope.input.message,
"timestamp": success.timestamp

};
 keepKeyboardOpen();
$scope.input.message = '';
$scope.messages.push(message);

 $timeout(function() {
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);

  $timeout(function() {
     //   $scope.messages.push(MockService.getMockMessage());
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 2000);


   },function(error){

   })


    };

     function getMessages() {
      // the service is mock but you would probably pass the toUser's GUID here
      ChatApp.getUserMessages($stateParams.uid).then(function(data) {
        $scope.doneLoading = true;
        $scope.messages = data;
     //   alert(JSON.stringify(data));

        $timeout(function() {
          viewScroll.scrollBottom();
        }, 0);
      });
    }

    $scope.back = function () {
      console.log($ionicHistory.viewHistory());
      $ionicHistory.goBack();
    }

      
  function keepKeyboardOpen() {
      console.log('keepKeyboardOpen');
      // txtInput.one('blur', function() {
      //   console.log('textarea blur, focus back on it');
      //   txtInput[0].focus();
      // });
    }

})

// fitlers
.filter('nl2br', ['$filter',
  function($filter) {
    return function(data) {
      if (!data) return data;
      return data.replace(/\n\r?/g, '<br />');
    };
  }
])

  .controller('VitalsCtrl', ['$scope', '$state', '$stateParams', 'sortedByList', '$ionicHistory','AppService', function ($scope, $state, $stateParams, sortedByList, $ionicHistory, AppService) {
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;
    $scope.selectedView = 'Today';
    $scope.DayView = true;

    $scope.patientProfile = {
      name: $stateParams.name,
      age: $stateParams.age,
      gender: $stateParams.gender,
      email: $stateParams.email,
      url: $stateParams.profile_url
    }

     init = function () {
      AppService.getVitals($stateParams.uid).then(function (success) {
        console.log("Vital Success")
        console.log(success)
        //getActivityDataForYesterday(success);
        //getActivityDataForWeek(success);
        //getActivityDataForMonth(success);
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
      var state = getStateTitle(id);
      $state.transitionTo(state, { name: $stateParams.name }, { reload: true });
    }

    init();

  }]);
