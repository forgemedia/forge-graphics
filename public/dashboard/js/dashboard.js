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
;app.controller('generalCGController',
    function($scope, $interval, localStorageService, socket){
        socket.on("general", function (msg) {
            $scope.general = msg;
			$scope.general.showLive = true;
        });

        $scope.$watch('general', function() {
            if ($scope.general) {
                socket.emit("general", $scope.general);
            } else {
                getGeneralData();
            }
        }, true);

        $scope.resetTicker = function() {
            $scope.general.tickerItems = [];
        };

        $scope.addTickerItem = function() {
            if ($scope.newTickerItem) $scope.general.tickerItems.push($scope.newTickerItem);
            $scope.newTickerItem = "";
        };

        $scope.commitTickerItems = function() {
            $scope.general.cTickerItems = $scope.general.tickerItems.slice();
        };

        $scope.removeTickerItem = function(index) {
            $scope.general.tickerItems.splice(index, 1);
        };

        $scope.triggerResetCG = function () {
            socket.emit("general:resetcg");
        };

		$scope.triggerVotesGraph = function() {
			socket.emit("general:showVotesGraph", [$scope.votesCsvFile, $scope.vwPos, $scope.vwWin]);
		};

		$scope.triggerVotesGraphDestruction = function() {
			socket.emit("general:destroyVotesGraph");
		};

		$scope.clearLocalStorage = function() {
			localStorageService.clearAll();
		};

        function getGeneralData() {
            socket.emit("general:get");
        };
    }
);
;app.controller('lowerThirdsCGController',
    function($scope, localStorageService, $timeout, $interval, $window, socket){
        var titleStored = localStorageService.get('lt_title');
        var headlineStored = localStorageService.get('lt_headline');
        var ongoingStored = localStorageService.get('lt_ongoing');
		var queueStored = localStorageService.get('lt_queue');

        if (titleStored === null) $scope.ltTitleDashEntries = {};
        else $scope.ltTitleDashEntries = titleStored;

        if (headlineStored === null) $scope.ltHeadlineDashEntries = [];
        else $scope.ltHeadlineDashEntries = headlineStored;

        if (ongoingStored === null) $scope.ltOngoingDashEntries = [];
        else $scope.ltOngoingDashEntries = ongoingStored;

		if (queueStored === null) $scope.queue = [];
        else $scope.queue = queueStored;

		socket.emit('teams:get');
		socket.on('teams', function(msg) {
			$scope.teams = msg;
		});

		$scope.queueAdd = function() {
			// console.log("Queue add");
			$scope.queue.push($scope.ltTitleDashEntries);

			$scope.ltTitleForm.$setPristine();
			$scope.ltTitleDashEntries = {};
		};

		$scope.editQueueItem = function(item, index) {
			$scope.copyQueueItem(item);

			$scope.queue.splice(index, 1);
		};

		$scope.copyQueueItem = function(item) {
			$scope.ltTitleDashEntries = item;
		};

        $scope.topSelections = [
            "Breaking News",
            "Incoming Result"
        ];

        // $scope.hlTopScratch = $scope.topSelections[0];

        // $scope.timeRemaining = 10;

        $scope.triggerTitleLowerThird = function (item) {
            socket.emit("lowerThirds:showTitle", item);
            // $interval(function () {
            //     $scope.timeRemaining--;
            // }, 1000, 10);
            // $timeout(function() {
            //     $scope.timeRemaining = 10;
            // }, 11000);
        };

		$scope.triggerTeamsLowerThird = function(item) {
			socket.emit("lowerThirds:teams", item);
		};

        $scope.triggerHeadlineLowerThird = function () {
            socket.emit("lowerThirds:showHeadline", $scope.ltHeadlineDashEntries);
        };

        $scope.updateHeadlineLowerThird = function () {
            socket.emit("lowerThirds:updateHeadline", $scope.ltHeadlineDashEntries);
        };

        $scope.hideHeadlineLowerThird = function () {
            socket.emit("lowerThirds:hideHeadline");
        };

        $scope.triggerOngoingLowerThird = function () {
            socket.emit("lowerThirds:showOngoing", $scope.ltOngoingDashEntries);
        };

        $scope.hideOngoingLowerThird = function () {
            socket.emit("lowerThirds:hideOngoing");
        };

        socket.on("lowerThirds", function (msg) {
            $scope.lowerThirds = msg;
        });

        $scope.storeEntries = function() {
            localStorageService.set('lt_title', $scope.ltTitleDashEntries);
            localStorageService.set('lt_headline', $scope.ltHeadlineDashEntries);
            localStorageService.set('lt_ongoing', $scope.ltOngoingDashEntries);
			localStorageService.set('lt_queue', $scope.queue);
        };

		$scope.clearLocalStorage = function() {
			localStorageService.clearAll();
		};

        $scope.$on("$destroy", $scope.storeEntries);
        $window.onbeforeunload = $scope.storeEntries;
    }
);
;app.controller('boxingCGController',
	function($scope, $rootScope, $timeout, socket) {
		socket.on("boxing", function (msg) {
            $scope.boxing = msg;
        });

        $scope.$watch('boxing', function() {
            if ($scope.boxing) {
                socket.emit("boxing", $scope.boxing);
            } else {
                getBoxingData();
            }
        }, true);

		$scope.resetRounds = function() {
			$scope.boxing.showBoxing = false;
			$timeout(function() {
				socket.emit("boxing:resetTimer");
				for (i = 0; i < 3; i++) $scope.boxing.roundComplete[i] = false;
			}, 1000);
		};
		$scope.resetTimer = function() {
			socket.emit("boxing:resetTimer");
		};

		$scope.startTimer = function() {
			socket.emit("boxing:startTimer");
		};

		$rootScope.$on('teardown', function() {
			$scope.resetRounds();
			$scope.boxing.showBoxing = false;
		});

        function getBoxingData() {
            socket.emit("boxing:get");
        };
	}
);
;app.controller('rugbyCGController', function($scope, $rootScope, $filter, socket) {
	socket.on("rugby", function (msg) {
		$scope.rugby = msg;
	});

	socket.emit('teams:get');
	socket.on('teams', function(msg) {
		$scope.teams = msg;
	});

	$scope.scoreAddLeft = function(score) {
		if ($scope.rugby.leftScore < 1 && score < 1) return;
		$scope.rugby.leftScore += score;
	};

	$scope.scoreAddRight = function(score) {
		if ($scope.rugby.rightScore < 1 && score < 1) return;
		else $scope.rugby.rightScore += score;
	};

	$scope.startTimer = function() {
		socket.emit("rugby:timer", 'start');
	};

	$scope.resetTimer = function() {
		socket.emit("rugby:timer", 'reset');
	};

	$scope.stopTimer = function() {
		socket.emit("rugby:timer", 'stop');
	};

	$scope.resumeTimer = function() {
		socket.emit("rugby:timer", 'resume');
	};

	$scope.resetScores = function() {
		$scope.rugby.leftScore = 0;
		$scope.rugby.rightScore = 0;
	};

	$rootScope.$on('teardown', function() {
		$scope.resetScores();
		$scope.resetTimer();
		$scope.rugby.showRugby = false;
	});

	$scope.$watch('rugby', function() {
		if ($scope.rugby) {
			socket.emit("rugby", $scope.rugby);
		} else {
			getRugbyData();
		}
	}, true);

	function getRugbyData() {
		socket.emit("rugby:get");
	};
});
