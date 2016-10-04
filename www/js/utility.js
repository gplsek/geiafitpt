angular.module('geiaFitApp').service('utilityService', ['$log',function ($log) {
    
    return{
       
       calculcateAge : function(dateString){
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
                {
                    age--;
                }
                return age;
        },

        unixTimeToDate : function(timeStamp){
            return new Date(timeStamp*1000);
        }

    };

}]);