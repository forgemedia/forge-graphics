var app = angular.module('CGDashboardApp', ['ngRoute', 'LocalStorageModule', 'socket-io', 'ui.toggle', 'ui.sortable']);

app.controller('AppCtrl',
    function($scope, $location, socket){
        $scope.menu = [];
		$scope.sports = [];
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

		$scope.sports.push({
			name: 'Boxing',
			url: '/boxing',
			type: 'link'
		});

		$scope.sports.push({
			name: 'Rugby Union',
			url: '/rugby',
			type: 'link'
		});

		socket.emit('project:get');
		socket.on('project', function(msg) {
			$scope.project = msg;
		});
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
                templateUrl: '/templates/general.html',
                controller: 'generalCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/templates/lowerThirds.html',
                controller: 'lowerThirdsCGController'
            })
			.when("/boxing", {
				templateUrl: '/templates/boxing.html',
				controller: 'boxingCGController'
			})
			.when("/rugby", {
				templateUrl: '/templates/rugby.html',
				controller: 'rugbyCGController'
			})
            .otherwise({redirectTo: '/general'});
    }
);
