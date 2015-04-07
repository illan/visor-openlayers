		$(document).foundation('offcanvas', 'reflow');

		var app=angular.module('app', ['mm.foundation','ngRoute']);
		angular.module('app').controller('OffCanvasCtrl', ['$scope','$http', function($scope,$http) {
			 $http.get('config.json').success(function(data) {
   			 $scope.data = data;
				 $scope.mapas=data.mapas;
				 $scope.servicios=data.servicios;
			  });

		}]);

		app.config(['$routeProvider',
		  function($routeProvider) {
			    $routeProvider.
			      when('/landing', {
			        templateUrl: 'html/list.html',
			        controller: 'ListCtrl'
			      }).
			      when('/maps/:layerId', {
			        templateUrl: 'html/maps.html',
			        controller: 'MapsCtrl'
			      }).

			      when('/acumuladas', {
			        templateUrl: 'html/maps.html',
			        controller: 'AccuCtrl'
			      }).
			      when('/gmaps', {
			        templateUrl: 'html/maps.html',
			        controller: 'GMapsCtrl'
			      }).
			      otherwise({
			        redirectTo: '/landing'
			      });
		  }]);

		app.controller('ListCtrl', ['$scope','$http', function($scope,$http) {
			 $http.get('config.json').success(function(data) {
   				 $scope.data = data;
				 $scope.mapas=data.mapas;
				 $scope.servicios=data.servicios;
			  });

			  $scope.orderProp = 'name';
		}]);

		app.controller('AccuCtrl',  ['$scope', '$routeParams','$http', function($scope, $routeParams,$http) {
			  $scope.layer = "hidrosur:precipitaciones_municipios";
			  $scope.leyendUrl="/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=";
			  init($scope.layer);
		}]);


		app.controller('MapsCtrl', ['$scope', '$routeParams','$http', function($scope, $routeParams,$http) {
			$scope.layer = $routeParams.layerId;
			$scope.leyendUrl="/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=";
			
			$http.get("maps/"+$scope.layer+".json").success(function(data){
					$scope.current=data;
					init($scope.layer);
			});		
		}]);
		
		app.controller('GMapsCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
			$scope.layer = $routeParams.layerId;
			$scope.leyendUrl="/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=";
			loader();
		}]);