angular.module('app.components', [])
.component('header', {
	template: '<ion-nav-bar class="bar-stable">'+
		    	  '<ion-nav-buttons side="right">'+
				   	'<button menu-toggle="right" class="button button-icon icon ion-navicon"></button>'+
				  '</ion-nav-buttons>'+
		    	'</ion-nav-bar>'
})
// .component('actionList', {
	
// 	controller:  function($scope, AppService){
// 		$scope.sortedByList = AppService.sortedByList();
// 		$scope.sortedBy = $scope.sortedByList[0].id;
// 	},
// 	template:   '<div class="sortedBy text-center">'+
// 		    		'<select ng-options="item.id as item.title for item in sortedByList" ng-model="sortedBy"></select>'+ 
// 				'</div>'
// })