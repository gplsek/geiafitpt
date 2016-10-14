angular.module('geiaFitApp').service('utilityService', ['$log',function ($log) {
    
    return{
       
       calculcateAge : function(dateString){
            var today = new Date();
            var newDate = moment.unix(dateString).utcOffset('-07:00').format();
            var birthDate = moment(newDate)
            var age = today.getFullYear() - birthDate.year();
            var m = today.getMonth() - birthDate.month();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.date())) 
                {
                    age--;
                }
                return age;
        },

        unixTimeToDate : function(timeStamp){
            return new Date(timeStamp*1000);
        },

        round : function (value, precision) {
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        }

    };

}]);