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
    email: "admin@geiafit.com",
    password: "FitGeia1!"
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
        var webExercisePages = Math.ceil(webExerciseList.length  / pageSize);

        console.log(myExerciseList.length +""+ myExercisePages);
        console.log(webExerciseList.length +""+ webExercisePages);

        for(i=0;i<myExercisePages;i++){
            var page = {
                id : i+1,
                title : "page "+(i+1)
              }
              $scope.pages.push(page);
        }

        for(i=0;i<webExercisePages;i++){
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

    $scope.showNext = function (pageNo) {
      var list = angular.copy($scope.tempWebExList);
      var offset = (pageNo - 1) * pageSize;
      $scope.webExercise = list.splice(offset, pageSize);
      $scope.selectedPage = $scope.webExPages[pageNo - 1].id;
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
    var activityDataForWeek = [];
    var activityDataForMonth = [];
    var activityDataForYesterday = '';

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
      console.log(activityDataForYesterday)
      var excPer = (activityDataForYesterday.total_exercise / activityDataForYesterday.total_exercise_goal) * 100;
      var stepsPer = (activityDataForYesterday.total_steps / activityDataForYesterday.total_steps_goal) * 100;
      var lowPer = (activityDataForYesterday.time_active_low / activityDataForYesterday.time_active_low_goal) * 100;
      var mediumPer = (activityDataForYesterday.time_active_medium / activityDataForYesterday.time_active_medium_goal) * 100;
      var highPer = (activityDataForYesterday.time_active_high / activityDataForYesterday.time_active_high_goal) * 100;

      console.log('exc' + excPer);
      console.log('exc' + stepsPer);
      console.log('exc' + lowPer);
      console.log('exc' + mediumPer);
      console.log('exc' + highPer);
      $scope.chartConfig = getChartConfig(excPer);
      $scope.chartConfig1 = getChartConfig(stepsPer);
      $scope.chartConfig2 = getChartConfig(lowPer);
      $scope.chartConfig3 = getChartConfig(mediumPer);
      $scope.chartConfig4 = getChartConfig(highPer);

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

          //console.log(tempDate)
          //console.log(dates[d])
          if (tempDate.getFullYear() === dates[d].getFullYear() && 
              tempDate.getMonth() === dates[d].getMonth() &&
              tempDate.getDate() === dates[d].getDate()) {
            var temp = activityDataForWeek[x];

            total_exercise_goal = parseInt(temp.total_exercise_goal)
            total_exercise = parseInt(temp.total_exercise)

            total_steps_goal = parseInt(temp.total_steps_goal)
            total_steps = parseInt(temp.total_steps)

            time_active_low_goal = parseInt(temp.time_active_low_goal)
            time_active_low = parseInt(temp.time_active_low)

            time_active_medium_goal = parseInt(temp.time_active_medium_goal)
            time_active_medium = parseInt(temp.time_active_medium)

            time_active_high_goal = parseInt(temp.time_active_high_goal)
            time_active_high = parseInt(temp.time_active_high)

            total_compliance_goal = parseInt(temp.total_exercise_goal) //TO DO
            total_compliance = parseInt(temp.total_exercise)  //TO DO

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

      $scope.chartConfigWeekViewExercise = getChartConfigForWeek(dataWeekExerciseGoal, dataWeekExercise)
      $scope.chartConfigWeekViewSteps = getChartConfigForWeek(dataWeekStepsGoal, dataWeekSteps)
      $scope.chartConfigWeekViewLow = getChartConfigForWeek(dataWeekLightGoal, dataWeekLight)
      $scope.chartConfigWeekViewMid = getChartConfigForWeek(dataWeekModerateGoal, dataWeekModerate)
      $scope.chartConfigWeekViewHigh = getChartConfigForWeek(dataWeekVigorousGoal, dataWeekVigorous)
      $scope.chartConfigWeekViewComp = getChartConfigForWeek(dataWeekComplianceGoal, dataWeekCompliance)

    }

    getActivityDataForMonth = function (successData) {
      var startDate = new Date();
      var endDate = new Date(startDate.getFullYear(), startDate.getMonth() - 7, startDate.getDate(),
        startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds())

      for (var x in successData) {
        var unixDate = successData[x].date
        var date = utilityService.unixTimeToDate(unixDate);
        //console.log(date)
        if (startDate > date && date > endDate) {
          activityDataForMonth.push(successData[x]);
        }
      }
    }

    init = function () {
      AppService.profile($stateParams.uid).then(function (success) {
        var imageUrl;
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

        $scope.patientProfile = {
          name: $stateParams.name,
          age: age,
          gender: patientData.gender,
          email: patientData.email,
          url: imageUrl
        }
      }, function (error) {

      })

      AppService.getActivity($stateParams.uid).then(function (success) {
        console.log("Success")
        getActivityDataForYesterday(success);
        getActivityDataForWeek(success);
        getActivityDataForMonth(success);
      }, function (error) {
        console.log("error")
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
          break;
        default:
          $scope.selectedView = 'day';
          $scope.DayView = true;
          $scope.WeekView = false;
          $scope.MonthView = false;

      }

    }


    function getChartConfig(data) {
      var chartConfig = {

        options: {
          //This is the Main Highcharts chart config. Any Highchart options are valid here.
          //will be overriden by values specified below.
          chart: {
            type: 'solidgauge',
            margin: 0,
            backgroundColor: 'transparent',
          },

          title: {
            text: null,
            style: {
              fontSize: '24px'
            }
          },

          tooltip: {
            borderWidth: 0,
            backgroundColor: 'none',
            shadow: false,
            style: {
              fontSize: '16px'
            },
            pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
            positioner: function (labelWidth, labelHeight) {
              return {
                x: 200 - labelWidth / 2,
                y: 180
              };
            }
          },

          pane: {
            startAngle: 0,
            endAngle: 360,
            background: [{ // Track for Move
              outerRadius: '100%',
              innerRadius: '100%',
              backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.3).get(),
              borderWidth: 0
            }
            ]
          },

          yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
          },

          plotOptions: {
            solidgauge: {
              borderWidth: '34px',
              dataLabels: {
                enabled: false
              },
              linecap: 'round',
              stickyTracking: false
            }
          },

          setOptions: {
            colors: ['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
          },

          series: [{
            name: 'Move',
            borderColor: Highcharts.getOptions().colors[0],
            data: [{
              color: "#f8f8f8",
              radius: '100%',
              innerRadius: '100%',
              y: 80
            }]
          }]
        },
        //The below properties are watched separately for changes.

        //Series object (optional) - a list of series using normal Highcharts series options.
        series: [{
          data: [data]
        }],

        //Boolean to control showing loading status on chart (optional)
        //Could be a string if you want to show specific loading text.
        loading: false,
        //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
        //properties currentMin and currentMax provided 2-way binding to the chart's maximum and minimum
        xAxis: {
          currentMin: 0,
          currentMax: 20,
          title: { text: 'values' }
        },
        //Whether to use Highstocks instead of Highcharts (optional). Defaults to false.
        useHighStocks: false,
        //size (optional) if left out the chart will default to size of the div or something sensible.
        size: {
          width: 200,
          height: 180
        },
        //function (optional)
        func: function (chart) {
          //setup some logic for the chart
        }
      };
      return chartConfig;
    }


    function getChartConfigForWeek(dataGoal, dataAchived) {
      var endDate = new Date();
      var startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7,
        endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds())
      var dateList = [];
      var date = startDate;
      while (date < endDate) {
        dateList.push(date.getDate())
        var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1,
          date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
        date = tempDate;
      }
      //console.log(endDate)
      //console.log(startDate)
      //console.log(dateList)
      //console.log(dataGoal)
      //console.log(dataAchived)

      var chartConfig = {
        options: {
          chart: {
            type: 'column',
            backgroundColor: 'transparent',
          },
          title: {
            text: 'Week view',
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              dataLabels: {
                enabled: true,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
              }
            }
          },
        },
        xAxis: {
          categories: [dateList[0], dateList[1], dateList[2], dateList[3], dateList[4], dateList[5], dateList[6]],
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Total '
          },
          /*stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',
                  color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
              }
          }*/
        },
        /* legend: {
             align: 'right',
             x: -30,
             verticalAlign: 'top',
             y: 25,
             floating: true,
             backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
             borderColor: '#CCC',
             borderWidth: 1,
             shadow: false
         },*/
        /* tooltip: {
             headerFormat: '<b>{point.x}</b><br/>',
             pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
         },*/
        series: [{
          data: [dataGoal[0], dataGoal[1], dataGoal[2], dataGoal[3],dataGoal[4],dataGoal[5],dataGoal[6]]
          //data: [2,3,4,5]
        }, {
            data: [dataAchived[0], dataAchived[1], dataAchived[2], dataAchived[3],dataAchived[4],dataAchived[5],dataAchived[6]]
            //data :[4,7,2,4]
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
AppService,$ionicScrollDelegate) {
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

  .controller('VitalsCtrl', ['$scope', '$state', '$stateParams', 'sortedByList', '$ionicHistory', function ($scope, $state, $stateParams, sortedByList, $ionicHistory) {
    $scope.sortedByList = sortedByList;
    $scope.sortedBy = $scope.sortedByList[0].id;

    $scope.patientProfile = {
      name: $stateParams.name,
      age: $stateParams.age,
      gender: $stateParams.gender,
      email: $stateParams.email,
      url: $stateParams.profile_url
    }

    $scope.selectedView = 'Today';

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



  }]);
