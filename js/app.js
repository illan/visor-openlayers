		$(document).foundation('offcanvas', 'reflow');

		var app=angular.module('app', ['mm.foundation','ngRoute']);
		angular.module('app').controller('OffCanvasCtrl', ['$scope','$http', function($scope,$http) {
			 $http.get('config.json').success(function(data) {
   			 $scope.data = data;
				 $scope.mapas=data.mapas;
				 $scope.servicios=data.servicios;
            $.extend(GEOSERVER,{
              pureCoverage:false,
              workspace:data.workspace,
              baselayer:data.baselayer,
              getPath:function(){ 
                	return "/geoserver/_WS_/wms".replace("_WS_",this.workspace); 
              }
            });  

			  });

		}]);

		app.config(['$routeProvider',
		  function($routeProvider) {
			    $routeProvider.
			      when('/', {
			        templateUrl: 'html/list.html',
			        controller: 'ListCtrl'
			      }).
			      when('/maps/:id', {
			        templateUrl: 'html/maps.html',
			        controller: 'MapsCtrl'
			      }).
			      when('/maps/:id/details', {
			        templateUrl: 'html/details.html',
			        controller: 'DetailsCtrl'
			      }).
			      otherwise({
			        redirectTo: '/'
			      });
		  }]);

		app.controller('ListCtrl', ['$scope','$http', function($scope,$http) {
			 $http.get('config.json').success(function(data) {
   			$scope.data = data;
            GEOSERVER.configure(data);
			  });
			  $scope.orderProp = 'name';
		}]);

		app.controller('MapsCtrl', ['$scope', '$routeParams','$http', function($scope, $routeParams,$http) {
         var id=$routeParams.id;
         GEOSERVER.loader(id);
			
        
        
		}]);
		
		app.controller('DetailsCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
			GEOSERVER.view($routeParams.id);
		}]);