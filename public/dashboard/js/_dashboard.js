var app = angular.module('CGDashboardApp', ['ngRoute', 'LocalStorageModule', 'socket-io', 'ui.toggle', 'ui.sortable']);

app.controller('AppCtrl',
    function($scope, $rootScope, $location, localStorageService, $filter, $window, socket){
        $scope.menu = [];
		$scope.modes = [];
		// $scope.currentSport = {};

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General/Bug',
            url: '/general',
            type: 'link'
        });

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link'
        });

		$scope.menu.push({
			name: 'Forge Varsity Live',
			url: '/varsityLive',
			type: 'link'
		});

		$scope.modes.push({
			name: 'Boxing',
			url: '/boxing',
			type: 'link'
		});

		$scope.modes.push({
			name: 'Rugby/Football',
			url: '/rugby',
			type: 'link'
		});

		var modeStored = localStorageService.get('gn_mode');
		if (modeStored === null) $scope.currentMode = $scope.modes[0];
        else $scope.currentMode = $filter('filter')($scope.modes, {name: modeStored})[0];

		$scope.$watch('currentMode', function() {
			$rootScope.$emit('teardown');
			$location.path($scope.menu[0].url);
		});

		socket.emit('project:get');
		socket.on('project', function(msg) {
			$scope.project = msg;
		});

		$scope.storeEntries = function() {
            localStorageService.set('gn_mode', $scope.currentMode.name);
        };

        $scope.$on("$destroy", $scope.storeEntries);
        $window.onbeforeunload = $scope.storeEntries;
    }
);

/*
 *  Configure the app routes
 */
app.config(
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('forge');

        $routeProvider
            .when("/general", {
                templateUrl: '/dashboard/templates/general.html',
                controller: 'generalCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/dashboard/templates/lowerThirds.html',
                controller: 'lowerThirdsCGController'
            })
			.when("/varsityLive", {
				templateUrl: '/dashboard/templates/varsity/varsityLive.html',
				controller: 'varsityLiveCGController'
			})
			.when("/boxing", {
				templateUrl: '/dashboard/templates/varsity/boxing.html',
				controller: 'boxingCGController'
			})
			.when("/rugby", {
				templateUrl: '/dashboard/templates/varsity/rugby.html',
				controller: 'rugbyCGController'
			})
            .otherwise({redirectTo: '/general'});
    }
);
