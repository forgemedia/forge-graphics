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
;
app.controller('generalCGController',
    function($scope, $rootScope, $interval, $timeout, localStorageService, $window, socket) {
		socket.emit("general:get");

		$scope.uadd = function(i) {
			if (!(($scope.general.score.uos+i) < 1)) $scope.general.score.uos+=i;
			else $scope.general.score.uos=0;
		};

		$scope.sadd = function(i) {
			if (!(($scope.general.score.shu+i) < 1)) $scope.general.score.shu+=i;
			else $scope.general.score.shu=0;
		};

		$scope.tadd = function(i) {
			if (!(($scope.general.score.total+i) < 1)) $scope.general.score.total+=i;
			else $scope.general.score.total=0;
		};

		$scope.cuIcons = [
			'tv',
			'radio',
			'radio extra'
			// 'headphones',
			// 'soccer-ball-o'
		];

		$scope.dataStores = {
			comingUp: []
		};

		// $scope.comingUp = [];

		for (var index in $scope.dataStores) {
			var ie = localStorageService.get('gn_' + index);
			if (ie) $scope.dataStores[index] = ie;
		};

        socket.on("general", function(msg) {
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

		$scope.triggerComingUp = function(cu) {
			socket.emit("general:comingUp", cu);
		};

		$scope.triggerSocial = function() {
			socket.emit("general:social");
		};

		$scope.triggerScore = function() {
			socket.emit("general:showScore");
		}

        $scope.toggleBugPosition = function() {
            var lp = $scope.general.showLogo;
            $scope.general.showLogo = false;
            $timeout(function() {
                $scope.general.logoLower = !$scope.general.logoLower;
            }, 2000);
            $timeout(function() {
                $scope.general.showLogo = lp;
            }, 4000);
        }

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

        $scope.triggerResetCG = function() {
            $rootScope.$emit('teardown');
            socket.emit("general:resetcg");
        };

        $scope.triggerVotesGraph = function() {
            socket.emit("general:showVotesGraph", [$scope.votesCsvFile, $scope.vwPos, $scope.vwWin]);
        };

        $scope.triggerVotesGraphDestruction = function() {
            socket.emit("general:destroyVotesGraph");
        };

		function getGeneralData() {
			socket.emit("general:get");
		};

		$scope.storeEntries = function() {
			for (var index in $scope.dataStores) {
				localStorageService.set('gn_' + index, $scope.dataStores[index]);
			};
		};

		$scope.clearLocalStorage = function() {
			localStorageService.clearAll();
		};

		$scope.$on("$destroy", $scope.storeEntries);
		$window.onbeforeunload = $scope.storeEntries;
    }
);
;
app.controller('lowerThirdsCGController',
    function($scope, localStorageService, $filter, $timeout, $interval, $window, socket){
		$scope.dataStores = {
			title: {},
			headline: {},
			ongoing: {},
			queue: [],
			teams: {}
		};

		socket.emit('teams:get');
		$scope.teams = {};
		socket.on('teams', function(msg) {
			$scope.teams = msg;
		});

		for (var index in $scope.dataStores) {
			var ie = localStorageService.get('lt_' + index);
			if (ie) $scope.dataStores[index] = ie;
		};

		$scope.queueAdd = function() {
			// console.log("Queue add");
			// console.log($scope.dataStores);
			$scope.dataStores.queue.push($scope.dataStores.title);

			$scope.ltTitleForm.$setPristine();
			$scope.dataStores.title = {};
		};

		$scope.editQueueItem = function(item, index) {
			$scope.copyQueueItem(item);

			$scope.dataStores.queue.splice(index, 1);
		};

		$scope.copyQueueItem = function(item) {
			$scope.dataStores.title = item;
		};

        $scope.topSelections = [
            "Breaking News",
            "Incoming Result"
        ];

        $scope.triggerTitleLowerThird = function (item) {
            socket.emit("lowerThirds:showTitle", item);
        };

		$scope.triggerTeamsLowerThird = function(item) {
			socket.emit("lowerThirds:teams", item);
		};

        $scope.triggerHeadlineLowerThird = function () {
            socket.emit("lowerThirds:showHeadline", $scope.dataStores.headline);
        };

        $scope.updateHeadlineLowerThird = function () {
            socket.emit("lowerThirds:updateHeadline", $scope.dataStores.headline);
        };

        $scope.hideHeadlineLowerThird = function () {
            socket.emit("lowerThirds:hideHeadline");
        };

        $scope.triggerOngoingLowerThird = function () {
            socket.emit("lowerThirds:showOngoing", $scope.dataStores.ongoing);
        };

        $scope.hideOngoingLowerThird = function () {
            socket.emit("lowerThirds:hideOngoing");
        };

        $scope.storeEntries = function() {
			for (var index in $scope.dataStores) {
				localStorageService.set('lt_' + index, $scope.dataStores[index]);
			};
        };
		
        $scope.$on("$destroy", $scope.storeEntries);
        $window.onbeforeunload = $scope.storeEntries;
    }
);
;
app.controller('boxingCGController',
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
;
app.controller('rugbyCGController', function($scope, $rootScope, $window, localStorageService, $filter, socket) {
	$scope.scratch = {};
	$scope.dataStores = {
		timer: {},
		limiter: {}
	};

	for (var index in $scope.dataStores) {
		var ie = localStorageService.get('lt_' + index);
		if (ie) $scope.dataStores[index] = ie;
	};

	socket.on("rugby", function (msg) {
		$scope.rugby = msg;
	});

	socket.emit('teams:get');
	socket.on('teams', function(msg) {
		$scope.teams = msg;
	});

	$scope.scoreAddLeft = function(score) {
		if ($scope.rugby.leftScore + score < 0 && score < 1) $scope.rugby.leftScore = 0;
		else $scope.rugby.leftScore += score;
	};

	$scope.scoreAddRight = function(score) {
		if ($scope.rugby.rightScore + score < 0 && score < 1) $scope.rugby.rightScore = 0;
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

	$scope.setTeams = function() {
		$scope.rugby.leftPosTeam = $scope.scratch.leftPosTeam;
		$scope.rugby.rightPosTeam = $scope.scratch.rightPosTeam;
	};

	$scope.setTime = function() {
		// console.log($scope.timeSetSecs);
		if (!$scope.dataStores.timer.mins) $scope.dataStores.timer.mins = 0;
		if (!$scope.dataStores.timer.secs) $scope.dataStores.timer.secs = 0;
		socket.emit("rugby:setTimer", (+$scope.dataStores.timer.mins * 60) + +$scope.dataStores.timer.secs);
	};

	$scope.setLimiter = function() {
		if (!$scope.dataStores.limiter.mins) $scope.dataStores.limiter.mins = 0;
		if (!$scope.dataStores.limiter.secs) $scope.dataStores.limiter.secs = 0;
		socket.emit("rugby:setLimiter", (+$scope.dataStores.limiter.mins * 60) + +$scope.dataStores.limiter.secs);
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

	$scope.storeEntries = function() {
		for (var index in $scope.dataStores) {
			localStorageService.set('lt_' + index, $scope.dataStores[index]);
		};
	};

	$scope.$on("$destroy", $scope.storeEntries);
	$window.onbeforeunload = $scope.storeEntries;
});
;
app.controller('varsityLiveCGController', function($scope, localStorageService, $window, socket) {
	socket.on("varsityLive", function(msg){
		$scope.varsityLive = msg;
	});

	$scope.desc = {
		vo: {
			people: []
		},
		igc: {},
		lt: {}
	};

	$scope.icons = [
		"phone",
		"tv",
		"headphones",
		"futbol-o"
	];

	for (var index in $scope.desc) {
		var ie = localStorageService.get('vl_' + index);
		if (ie) $scope.desc[index] = ie;
	};

	socket.emit("varsityLive:get");

	$scope.triggerVo = function(vo) {
		socket.emit('varsityLive:vo', vo);
	};

	$scope.hideVo = function() {
		socket.emit('varsityLive:vo', 2);
	};

	$scope.triggerIgc = function(igc) {
		socket.emit('varsityLive:igc', igc);
	};

	$scope.hideIgc = function() {
		socket.emit('varsityLive:igc', 2)
	};

	$scope.triggerLt = function(lt) {
		socket.emit('varsityLive:lt', lt);
	};

	$scope.$watch('varsityLive', function() {
		if ($scope.varsityLive) {
			socket.emit("varsityLive", $scope.varsityLive);
		} else {
			getVarsityLiveData();
		}
	}, true);

	function getVarsityLiveData() {
		socket.emit("varsityLive:get");
	};

	$scope.storeEntries = function() {
		for (var index in $scope.desc) {
			localStorageService.set('vl_' + index, $scope.desc[index]);
		};
	};

	$scope.$on("$destroy", $scope.storeEntries);
	$window.onbeforeunload = $scope.storeEntries;
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9kYXNoYm9hcmQuanMiLCJfZ2VuZXJhbC5qcyIsIl9sb3dlclRoaXJkcy5qcyIsInZhcnNpdHkvX2JveGluZy5qcyIsInZhcnNpdHkvX3J1Z2J5LmpzIiwidmFyc2l0eS9fdmFyc2l0eUxpdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJkYXNoYm9hcmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ0NHRGFzaGJvYXJkQXBwJywgWyduZ1JvdXRlJywgJ0xvY2FsU3RvcmFnZU1vZHVsZScsICdzb2NrZXQtaW8nLCAndWkudG9nZ2xlJywgJ3VpLnNvcnRhYmxlJ10pO1xuXG5hcHAuY29udHJvbGxlcignQXBwQ3RybCcsXG4gICAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIGxvY2FsU3RvcmFnZVNlcnZpY2UsICRmaWx0ZXIsICR3aW5kb3csIHNvY2tldCl7XG4gICAgICAgICRzY29wZS5tZW51ID0gW107XG5cdFx0JHNjb3BlLm1vZGVzID0gW107XG5cdFx0Ly8gJHNjb3BlLmN1cnJlbnRTcG9ydCA9IHt9O1xuXG4gICAgICAgICRzY29wZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uICh2aWV3TG9jYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB2aWV3TG9jYXRpb24gPT09ICRsb2NhdGlvbi5wYXRoKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLm1lbnUucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiAnR2VuZXJhbC9CdWcnLFxuICAgICAgICAgICAgdXJsOiAnL2dlbmVyYWwnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmsnXG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5tZW51LnB1c2goe1xuICAgICAgICAgICAgbmFtZTogJ0xvd2VyIFRoaXJkcycsXG4gICAgICAgICAgICB1cmw6ICcvbG93ZXJUaGlyZHMnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmsnXG4gICAgICAgIH0pO1xuXG5cdFx0JHNjb3BlLm1lbnUucHVzaCh7XG5cdFx0XHRuYW1lOiAnRm9yZ2UgVmFyc2l0eSBMaXZlJyxcblx0XHRcdHVybDogJy92YXJzaXR5TGl2ZScsXG5cdFx0XHR0eXBlOiAnbGluaydcblx0XHR9KTtcblxuXHRcdCRzY29wZS5tb2Rlcy5wdXNoKHtcblx0XHRcdG5hbWU6ICdCb3hpbmcnLFxuXHRcdFx0dXJsOiAnL2JveGluZycsXG5cdFx0XHR0eXBlOiAnbGluaydcblx0XHR9KTtcblxuXHRcdCRzY29wZS5tb2Rlcy5wdXNoKHtcblx0XHRcdG5hbWU6ICdSdWdieS9Gb290YmFsbCcsXG5cdFx0XHR1cmw6ICcvcnVnYnknLFxuXHRcdFx0dHlwZTogJ2xpbmsnXG5cdFx0fSk7XG5cblx0XHR2YXIgbW9kZVN0b3JlZCA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KCdnbl9tb2RlJyk7XG5cdFx0aWYgKG1vZGVTdG9yZWQgPT09IG51bGwpICRzY29wZS5jdXJyZW50TW9kZSA9ICRzY29wZS5tb2Rlc1swXTtcbiAgICAgICAgZWxzZSAkc2NvcGUuY3VycmVudE1vZGUgPSAkZmlsdGVyKCdmaWx0ZXInKSgkc2NvcGUubW9kZXMsIHtuYW1lOiBtb2RlU3RvcmVkfSlbMF07XG5cblx0XHQkc2NvcGUuJHdhdGNoKCdjdXJyZW50TW9kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JHJvb3RTY29wZS4kZW1pdCgndGVhcmRvd24nKTtcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCRzY29wZS5tZW51WzBdLnVybCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQuZW1pdCgncHJvamVjdDpnZXQnKTtcblx0XHRzb2NrZXQub24oJ3Byb2plY3QnLCBmdW5jdGlvbihtc2cpIHtcblx0XHRcdCRzY29wZS5wcm9qZWN0ID0gbXNnO1xuXHRcdH0pO1xuXG5cdFx0JHNjb3BlLnN0b3JlRW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJ2duX21vZGUnLCAkc2NvcGUuY3VycmVudE1vZGUubmFtZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLiRvbihcIiRkZXN0cm95XCIsICRzY29wZS5zdG9yZUVudHJpZXMpO1xuICAgICAgICAkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gJHNjb3BlLnN0b3JlRW50cmllcztcbiAgICB9XG4pO1xuXG4vKlxuICogIENvbmZpZ3VyZSB0aGUgYXBwIHJvdXRlc1xuICovXG5hcHAuY29uZmlnKFxuICAgIGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlUHJvdmlkZXIpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyLnNldFByZWZpeCgnZm9yZ2UnKTtcblxuICAgICAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAgICAgLndoZW4oXCIvZ2VuZXJhbFwiLCB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvZGFzaGJvYXJkL3RlbXBsYXRlcy9nZW5lcmFsLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdnZW5lcmFsQ0dDb250cm9sbGVyJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC53aGVuKFwiL2xvd2VyVGhpcmRzXCIsIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9kYXNoYm9hcmQvdGVtcGxhdGVzL2xvd2VyVGhpcmRzLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdsb3dlclRoaXJkc0NHQ29udHJvbGxlcidcbiAgICAgICAgICAgIH0pXG5cdFx0XHQud2hlbihcIi92YXJzaXR5TGl2ZVwiLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnL2Rhc2hib2FyZC90ZW1wbGF0ZXMvdmFyc2l0eS92YXJzaXR5TGl2ZS5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ3ZhcnNpdHlMaXZlQ0dDb250cm9sbGVyJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKFwiL2JveGluZ1wiLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnL2Rhc2hib2FyZC90ZW1wbGF0ZXMvdmFyc2l0eS9ib3hpbmcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdib3hpbmdDR0NvbnRyb2xsZXInXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oXCIvcnVnYnlcIiwge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJy9kYXNoYm9hcmQvdGVtcGxhdGVzL3ZhcnNpdHkvcnVnYnkuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdydWdieUNHQ29udHJvbGxlcidcblx0XHRcdH0pXG4gICAgICAgICAgICAub3RoZXJ3aXNlKHtyZWRpcmVjdFRvOiAnL2dlbmVyYWwnfSk7XG4gICAgfVxuKTtcbiIsImFwcC5jb250cm9sbGVyKCdnZW5lcmFsQ0dDb250cm9sbGVyJyxcbiAgICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRpbnRlcnZhbCwgJHRpbWVvdXQsIGxvY2FsU3RvcmFnZVNlcnZpY2UsICR3aW5kb3csIHNvY2tldCkge1xuXHRcdHNvY2tldC5lbWl0KFwiZ2VuZXJhbDpnZXRcIik7XG5cblx0XHQkc2NvcGUudWFkZCA9IGZ1bmN0aW9uKGkpIHtcblx0XHRcdGlmICghKCgkc2NvcGUuZ2VuZXJhbC5zY29yZS51b3MraSkgPCAxKSkgJHNjb3BlLmdlbmVyYWwuc2NvcmUudW9zKz1pO1xuXHRcdFx0ZWxzZSAkc2NvcGUuZ2VuZXJhbC5zY29yZS51b3M9MDtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLnNhZGQgPSBmdW5jdGlvbihpKSB7XG5cdFx0XHRpZiAoISgoJHNjb3BlLmdlbmVyYWwuc2NvcmUuc2h1K2kpIDwgMSkpICRzY29wZS5nZW5lcmFsLnNjb3JlLnNodSs9aTtcblx0XHRcdGVsc2UgJHNjb3BlLmdlbmVyYWwuc2NvcmUuc2h1PTA7XG5cdFx0fTtcblxuXHRcdCRzY29wZS50YWRkID0gZnVuY3Rpb24oaSkge1xuXHRcdFx0aWYgKCEoKCRzY29wZS5nZW5lcmFsLnNjb3JlLnRvdGFsK2kpIDwgMSkpICRzY29wZS5nZW5lcmFsLnNjb3JlLnRvdGFsKz1pO1xuXHRcdFx0ZWxzZSAkc2NvcGUuZ2VuZXJhbC5zY29yZS50b3RhbD0wO1xuXHRcdH07XG5cblx0XHQkc2NvcGUuY3VJY29ucyA9IFtcblx0XHRcdCd0dicsXG5cdFx0XHQncmFkaW8nLFxuXHRcdFx0J3JhZGlvIGV4dHJhJ1xuXHRcdFx0Ly8gJ2hlYWRwaG9uZXMnLFxuXHRcdFx0Ly8gJ3NvY2Nlci1iYWxsLW8nXG5cdFx0XTtcblxuXHRcdCRzY29wZS5kYXRhU3RvcmVzID0ge1xuXHRcdFx0Y29taW5nVXA6IFtdXG5cdFx0fTtcblxuXHRcdC8vICRzY29wZS5jb21pbmdVcCA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaW5kZXggaW4gJHNjb3BlLmRhdGFTdG9yZXMpIHtcblx0XHRcdHZhciBpZSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KCdnbl8nICsgaW5kZXgpO1xuXHRcdFx0aWYgKGllKSAkc2NvcGUuZGF0YVN0b3Jlc1tpbmRleF0gPSBpZTtcblx0XHR9O1xuXG4gICAgICAgIHNvY2tldC5vbihcImdlbmVyYWxcIiwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2VuZXJhbCA9IG1zZztcbiAgICAgICAgICAgICRzY29wZS5nZW5lcmFsLnNob3dMaXZlID0gdHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnZ2VuZXJhbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5nZW5lcmFsKSB7XG4gICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoXCJnZW5lcmFsXCIsICRzY29wZS5nZW5lcmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0R2VuZXJhbERhdGEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cblx0XHQkc2NvcGUudHJpZ2dlckNvbWluZ1VwID0gZnVuY3Rpb24oY3UpIHtcblx0XHRcdHNvY2tldC5lbWl0KFwiZ2VuZXJhbDpjb21pbmdVcFwiLCBjdSk7XG5cdFx0fTtcblxuXHRcdCRzY29wZS50cmlnZ2VyU29jaWFsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcImdlbmVyYWw6c29jaWFsXCIpO1xuXHRcdH07XG5cblx0XHQkc2NvcGUudHJpZ2dlclNjb3JlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcImdlbmVyYWw6c2hvd1Njb3JlXCIpO1xuXHRcdH1cblxuICAgICAgICAkc2NvcGUudG9nZ2xlQnVnUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBscCA9ICRzY29wZS5nZW5lcmFsLnNob3dMb2dvO1xuICAgICAgICAgICAgJHNjb3BlLmdlbmVyYWwuc2hvd0xvZ28gPSBmYWxzZTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5nZW5lcmFsLmxvZ29Mb3dlciA9ICEkc2NvcGUuZ2VuZXJhbC5sb2dvTG93ZXI7XG4gICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5nZW5lcmFsLnNob3dMb2dvID0gbHA7XG4gICAgICAgICAgICB9LCA0MDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5yZXNldFRpY2tlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHNjb3BlLmdlbmVyYWwudGlja2VySXRlbXMgPSBbXTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuYWRkVGlja2VySXRlbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5uZXdUaWNrZXJJdGVtKSAkc2NvcGUuZ2VuZXJhbC50aWNrZXJJdGVtcy5wdXNoKCRzY29wZS5uZXdUaWNrZXJJdGVtKTtcbiAgICAgICAgICAgICRzY29wZS5uZXdUaWNrZXJJdGVtID0gXCJcIjtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY29tbWl0VGlja2VySXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5nZW5lcmFsLmNUaWNrZXJJdGVtcyA9ICRzY29wZS5nZW5lcmFsLnRpY2tlckl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnJlbW92ZVRpY2tlckl0ZW0gPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgJHNjb3BlLmdlbmVyYWwudGlja2VySXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudHJpZ2dlclJlc2V0Q0cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGVtaXQoJ3RlYXJkb3duJyk7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdChcImdlbmVyYWw6cmVzZXRjZ1wiKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudHJpZ2dlclZvdGVzR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwiZ2VuZXJhbDpzaG93Vm90ZXNHcmFwaFwiLCBbJHNjb3BlLnZvdGVzQ3N2RmlsZSwgJHNjb3BlLnZ3UG9zLCAkc2NvcGUudndXaW5dKTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudHJpZ2dlclZvdGVzR3JhcGhEZXN0cnVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoXCJnZW5lcmFsOmRlc3Ryb3lWb3Rlc0dyYXBoXCIpO1xuICAgICAgICB9O1xuXG5cdFx0ZnVuY3Rpb24gZ2V0R2VuZXJhbERhdGEoKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcImdlbmVyYWw6Z2V0XCIpO1xuXHRcdH07XG5cblx0XHQkc2NvcGUuc3RvcmVFbnRyaWVzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRmb3IgKHZhciBpbmRleCBpbiAkc2NvcGUuZGF0YVN0b3Jlcykge1xuXHRcdFx0XHRsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldCgnZ25fJyArIGluZGV4LCAkc2NvcGUuZGF0YVN0b3Jlc1tpbmRleF0pO1xuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLmNsZWFyTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2NhbFN0b3JhZ2VTZXJ2aWNlLmNsZWFyQWxsKCk7XG5cdFx0fTtcblxuXHRcdCRzY29wZS4kb24oXCIkZGVzdHJveVwiLCAkc2NvcGUuc3RvcmVFbnRyaWVzKTtcblx0XHQkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gJHNjb3BlLnN0b3JlRW50cmllcztcbiAgICB9XG4pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ2xvd2VyVGhpcmRzQ0dDb250cm9sbGVyJyxcbiAgICBmdW5jdGlvbigkc2NvcGUsIGxvY2FsU3RvcmFnZVNlcnZpY2UsICRmaWx0ZXIsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICR3aW5kb3csIHNvY2tldCl7XG5cdFx0JHNjb3BlLmRhdGFTdG9yZXMgPSB7XG5cdFx0XHR0aXRsZToge30sXG5cdFx0XHRoZWFkbGluZToge30sXG5cdFx0XHRvbmdvaW5nOiB7fSxcblx0XHRcdHF1ZXVlOiBbXSxcblx0XHRcdHRlYW1zOiB7fVxuXHRcdH07XG5cblx0XHRzb2NrZXQuZW1pdCgndGVhbXM6Z2V0Jyk7XG5cdFx0JHNjb3BlLnRlYW1zID0ge307XG5cdFx0c29ja2V0Lm9uKCd0ZWFtcycsIGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0JHNjb3BlLnRlYW1zID0gbXNnO1xuXHRcdH0pO1xuXG5cdFx0Zm9yICh2YXIgaW5kZXggaW4gJHNjb3BlLmRhdGFTdG9yZXMpIHtcblx0XHRcdHZhciBpZSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KCdsdF8nICsgaW5kZXgpO1xuXHRcdFx0aWYgKGllKSAkc2NvcGUuZGF0YVN0b3Jlc1tpbmRleF0gPSBpZTtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLnF1ZXVlQWRkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcIlF1ZXVlIGFkZFwiKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCRzY29wZS5kYXRhU3RvcmVzKTtcblx0XHRcdCRzY29wZS5kYXRhU3RvcmVzLnF1ZXVlLnB1c2goJHNjb3BlLmRhdGFTdG9yZXMudGl0bGUpO1xuXG5cdFx0XHQkc2NvcGUubHRUaXRsZUZvcm0uJHNldFByaXN0aW5lKCk7XG5cdFx0XHQkc2NvcGUuZGF0YVN0b3Jlcy50aXRsZSA9IHt9O1xuXHRcdH07XG5cblx0XHQkc2NvcGUuZWRpdFF1ZXVlSXRlbSA9IGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG5cdFx0XHQkc2NvcGUuY29weVF1ZXVlSXRlbShpdGVtKTtcblxuXHRcdFx0JHNjb3BlLmRhdGFTdG9yZXMucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLmNvcHlRdWV1ZUl0ZW0gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHQkc2NvcGUuZGF0YVN0b3Jlcy50aXRsZSA9IGl0ZW07XG5cdFx0fTtcblxuICAgICAgICAkc2NvcGUudG9wU2VsZWN0aW9ucyA9IFtcbiAgICAgICAgICAgIFwiQnJlYWtpbmcgTmV3c1wiLFxuICAgICAgICAgICAgXCJJbmNvbWluZyBSZXN1bHRcIlxuICAgICAgICBdO1xuXG4gICAgICAgICRzY29wZS50cmlnZ2VyVGl0bGVMb3dlclRoaXJkID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwibG93ZXJUaGlyZHM6c2hvd1RpdGxlXCIsIGl0ZW0pO1xuICAgICAgICB9O1xuXG5cdFx0JHNjb3BlLnRyaWdnZXJUZWFtc0xvd2VyVGhpcmQgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcImxvd2VyVGhpcmRzOnRlYW1zXCIsIGl0ZW0pO1xuXHRcdH07XG5cbiAgICAgICAgJHNjb3BlLnRyaWdnZXJIZWFkbGluZUxvd2VyVGhpcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdChcImxvd2VyVGhpcmRzOnNob3dIZWFkbGluZVwiLCAkc2NvcGUuZGF0YVN0b3Jlcy5oZWFkbGluZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnVwZGF0ZUhlYWRsaW5lTG93ZXJUaGlyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwibG93ZXJUaGlyZHM6dXBkYXRlSGVhZGxpbmVcIiwgJHNjb3BlLmRhdGFTdG9yZXMuaGVhZGxpbmUpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5oaWRlSGVhZGxpbmVMb3dlclRoaXJkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoXCJsb3dlclRoaXJkczpoaWRlSGVhZGxpbmVcIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnRyaWdnZXJPbmdvaW5nTG93ZXJUaGlyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwibG93ZXJUaGlyZHM6c2hvd09uZ29pbmdcIiwgJHNjb3BlLmRhdGFTdG9yZXMub25nb2luZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmhpZGVPbmdvaW5nTG93ZXJUaGlyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwibG93ZXJUaGlyZHM6aGlkZU9uZ29pbmdcIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnN0b3JlRW50cmllcyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Zm9yICh2YXIgaW5kZXggaW4gJHNjb3BlLmRhdGFTdG9yZXMpIHtcblx0XHRcdFx0bG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJ2x0XycgKyBpbmRleCwgJHNjb3BlLmRhdGFTdG9yZXNbaW5kZXhdKTtcblx0XHRcdH07XG4gICAgICAgIH07XG5cdFx0XG4gICAgICAgICRzY29wZS4kb24oXCIkZGVzdHJveVwiLCAkc2NvcGUuc3RvcmVFbnRyaWVzKTtcbiAgICAgICAgJHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9ICRzY29wZS5zdG9yZUVudHJpZXM7XG4gICAgfVxuKTtcbiIsImFwcC5jb250cm9sbGVyKCdib3hpbmdDR0NvbnRyb2xsZXInLFxuXHRmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCBzb2NrZXQpIHtcblx0XHRzb2NrZXQub24oXCJib3hpbmdcIiwgZnVuY3Rpb24gKG1zZykge1xuICAgICAgICAgICAgJHNjb3BlLmJveGluZyA9IG1zZztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnYm94aW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmJveGluZykge1xuICAgICAgICAgICAgICAgIHNvY2tldC5lbWl0KFwiYm94aW5nXCIsICRzY29wZS5ib3hpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXRCb3hpbmdEYXRhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG5cdFx0JHNjb3BlLnJlc2V0Um91bmRzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkc2NvcGUuYm94aW5nLnNob3dCb3hpbmcgPSBmYWxzZTtcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzb2NrZXQuZW1pdChcImJveGluZzpyZXNldFRpbWVyXCIpO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSAkc2NvcGUuYm94aW5nLnJvdW5kQ29tcGxldGVbaV0gPSBmYWxzZTtcblx0XHRcdH0sIDEwMDApO1xuXHRcdH07XG5cdFx0JHNjb3BlLnJlc2V0VGltZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdHNvY2tldC5lbWl0KFwiYm94aW5nOnJlc2V0VGltZXJcIik7XG5cdFx0fTtcblxuXHRcdCRzY29wZS5zdGFydFRpbWVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcImJveGluZzpzdGFydFRpbWVyXCIpO1xuXHRcdH07XG5cblx0XHQkcm9vdFNjb3BlLiRvbigndGVhcmRvd24nLCBmdW5jdGlvbigpIHtcblx0XHRcdCRzY29wZS5yZXNldFJvdW5kcygpO1xuXHRcdFx0JHNjb3BlLmJveGluZy5zaG93Qm94aW5nID0gZmFsc2U7XG5cdFx0fSk7XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Qm94aW5nRGF0YSgpIHtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KFwiYm94aW5nOmdldFwiKTtcbiAgICAgICAgfTtcblx0fVxuKTtcbiIsImFwcC5jb250cm9sbGVyKCdydWdieUNHQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHdpbmRvdywgbG9jYWxTdG9yYWdlU2VydmljZSwgJGZpbHRlciwgc29ja2V0KSB7XG5cdCRzY29wZS5zY3JhdGNoID0ge307XG5cdCRzY29wZS5kYXRhU3RvcmVzID0ge1xuXHRcdHRpbWVyOiB7fSxcblx0XHRsaW1pdGVyOiB7fVxuXHR9O1xuXG5cdGZvciAodmFyIGluZGV4IGluICRzY29wZS5kYXRhU3RvcmVzKSB7XG5cdFx0dmFyIGllID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ2x0XycgKyBpbmRleCk7XG5cdFx0aWYgKGllKSAkc2NvcGUuZGF0YVN0b3Jlc1tpbmRleF0gPSBpZTtcblx0fTtcblxuXHRzb2NrZXQub24oXCJydWdieVwiLCBmdW5jdGlvbiAobXNnKSB7XG5cdFx0JHNjb3BlLnJ1Z2J5ID0gbXNnO1xuXHR9KTtcblxuXHRzb2NrZXQuZW1pdCgndGVhbXM6Z2V0Jyk7XG5cdHNvY2tldC5vbigndGVhbXMnLCBmdW5jdGlvbihtc2cpIHtcblx0XHQkc2NvcGUudGVhbXMgPSBtc2c7XG5cdH0pO1xuXG5cdCRzY29wZS5zY29yZUFkZExlZnQgPSBmdW5jdGlvbihzY29yZSkge1xuXHRcdGlmICgkc2NvcGUucnVnYnkubGVmdFNjb3JlICsgc2NvcmUgPCAwICYmIHNjb3JlIDwgMSkgJHNjb3BlLnJ1Z2J5LmxlZnRTY29yZSA9IDA7XG5cdFx0ZWxzZSAkc2NvcGUucnVnYnkubGVmdFNjb3JlICs9IHNjb3JlO1xuXHR9O1xuXG5cdCRzY29wZS5zY29yZUFkZFJpZ2h0ID0gZnVuY3Rpb24oc2NvcmUpIHtcblx0XHRpZiAoJHNjb3BlLnJ1Z2J5LnJpZ2h0U2NvcmUgKyBzY29yZSA8IDAgJiYgc2NvcmUgPCAxKSAkc2NvcGUucnVnYnkucmlnaHRTY29yZSA9IDA7XG5cdFx0ZWxzZSAkc2NvcGUucnVnYnkucmlnaHRTY29yZSArPSBzY29yZTtcblx0fTtcblxuXHQkc2NvcGUuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKCkge1xuXHRcdHNvY2tldC5lbWl0KFwicnVnYnk6dGltZXJcIiwgJ3N0YXJ0Jyk7XG5cdH07XG5cblx0JHNjb3BlLnJlc2V0VGltZXIgPSBmdW5jdGlvbigpIHtcblx0XHRzb2NrZXQuZW1pdChcInJ1Z2J5OnRpbWVyXCIsICdyZXNldCcpO1xuXHR9O1xuXG5cdCRzY29wZS5zdG9wVGltZXIgPSBmdW5jdGlvbigpIHtcblx0XHRzb2NrZXQuZW1pdChcInJ1Z2J5OnRpbWVyXCIsICdzdG9wJyk7XG5cdH07XG5cblx0JHNjb3BlLnJlc3VtZVRpbWVyID0gZnVuY3Rpb24oKSB7XG5cdFx0c29ja2V0LmVtaXQoXCJydWdieTp0aW1lclwiLCAncmVzdW1lJyk7XG5cdH07XG5cblx0JHNjb3BlLnJlc2V0U2NvcmVzID0gZnVuY3Rpb24oKSB7XG5cdFx0JHNjb3BlLnJ1Z2J5LmxlZnRTY29yZSA9IDA7XG5cdFx0JHNjb3BlLnJ1Z2J5LnJpZ2h0U2NvcmUgPSAwO1xuXHR9O1xuXG5cdCRzY29wZS5zZXRUZWFtcyA9IGZ1bmN0aW9uKCkge1xuXHRcdCRzY29wZS5ydWdieS5sZWZ0UG9zVGVhbSA9ICRzY29wZS5zY3JhdGNoLmxlZnRQb3NUZWFtO1xuXHRcdCRzY29wZS5ydWdieS5yaWdodFBvc1RlYW0gPSAkc2NvcGUuc2NyYXRjaC5yaWdodFBvc1RlYW07XG5cdH07XG5cblx0JHNjb3BlLnNldFRpbWUgPSBmdW5jdGlvbigpIHtcblx0XHQvLyBjb25zb2xlLmxvZygkc2NvcGUudGltZVNldFNlY3MpO1xuXHRcdGlmICghJHNjb3BlLmRhdGFTdG9yZXMudGltZXIubWlucykgJHNjb3BlLmRhdGFTdG9yZXMudGltZXIubWlucyA9IDA7XG5cdFx0aWYgKCEkc2NvcGUuZGF0YVN0b3Jlcy50aW1lci5zZWNzKSAkc2NvcGUuZGF0YVN0b3Jlcy50aW1lci5zZWNzID0gMDtcblx0XHRzb2NrZXQuZW1pdChcInJ1Z2J5OnNldFRpbWVyXCIsICgrJHNjb3BlLmRhdGFTdG9yZXMudGltZXIubWlucyAqIDYwKSArICskc2NvcGUuZGF0YVN0b3Jlcy50aW1lci5zZWNzKTtcblx0fTtcblxuXHQkc2NvcGUuc2V0TGltaXRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghJHNjb3BlLmRhdGFTdG9yZXMubGltaXRlci5taW5zKSAkc2NvcGUuZGF0YVN0b3Jlcy5saW1pdGVyLm1pbnMgPSAwO1xuXHRcdGlmICghJHNjb3BlLmRhdGFTdG9yZXMubGltaXRlci5zZWNzKSAkc2NvcGUuZGF0YVN0b3Jlcy5saW1pdGVyLnNlY3MgPSAwO1xuXHRcdHNvY2tldC5lbWl0KFwicnVnYnk6c2V0TGltaXRlclwiLCAoKyRzY29wZS5kYXRhU3RvcmVzLmxpbWl0ZXIubWlucyAqIDYwKSArICskc2NvcGUuZGF0YVN0b3Jlcy5saW1pdGVyLnNlY3MpO1xuXHR9O1xuXG5cdCRyb290U2NvcGUuJG9uKCd0ZWFyZG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdCRzY29wZS5yZXNldFNjb3JlcygpO1xuXHRcdCRzY29wZS5yZXNldFRpbWVyKCk7XG5cdFx0JHNjb3BlLnJ1Z2J5LnNob3dSdWdieSA9IGZhbHNlO1xuXHR9KTtcblxuXHQkc2NvcGUuJHdhdGNoKCdydWdieScsIGZ1bmN0aW9uKCkge1xuXHRcdGlmICgkc2NvcGUucnVnYnkpIHtcblx0XHRcdHNvY2tldC5lbWl0KFwicnVnYnlcIiwgJHNjb3BlLnJ1Z2J5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Z2V0UnVnYnlEYXRhKCk7XG5cdFx0fVxuXHR9LCB0cnVlKTtcblxuXHRmdW5jdGlvbiBnZXRSdWdieURhdGEoKSB7XG5cdFx0c29ja2V0LmVtaXQoXCJydWdieTpnZXRcIik7XG5cdH07XG5cblx0JHNjb3BlLnN0b3JlRW50cmllcyA9IGZ1bmN0aW9uKCkge1xuXHRcdGZvciAodmFyIGluZGV4IGluICRzY29wZS5kYXRhU3RvcmVzKSB7XG5cdFx0XHRsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldCgnbHRfJyArIGluZGV4LCAkc2NvcGUuZGF0YVN0b3Jlc1tpbmRleF0pO1xuXHRcdH07XG5cdH07XG5cblx0JHNjb3BlLiRvbihcIiRkZXN0cm95XCIsICRzY29wZS5zdG9yZUVudHJpZXMpO1xuXHQkd2luZG93Lm9uYmVmb3JldW5sb2FkID0gJHNjb3BlLnN0b3JlRW50cmllcztcbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ3ZhcnNpdHlMaXZlQ0dDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCAkd2luZG93LCBzb2NrZXQpIHtcblx0c29ja2V0Lm9uKFwidmFyc2l0eUxpdmVcIiwgZnVuY3Rpb24obXNnKXtcblx0XHQkc2NvcGUudmFyc2l0eUxpdmUgPSBtc2c7XG5cdH0pO1xuXG5cdCRzY29wZS5kZXNjID0ge1xuXHRcdHZvOiB7XG5cdFx0XHRwZW9wbGU6IFtdXG5cdFx0fSxcblx0XHRpZ2M6IHt9LFxuXHRcdGx0OiB7fVxuXHR9O1xuXG5cdCRzY29wZS5pY29ucyA9IFtcblx0XHRcInBob25lXCIsXG5cdFx0XCJ0dlwiLFxuXHRcdFwiaGVhZHBob25lc1wiLFxuXHRcdFwiZnV0Ym9sLW9cIlxuXHRdO1xuXG5cdGZvciAodmFyIGluZGV4IGluICRzY29wZS5kZXNjKSB7XG5cdFx0dmFyIGllID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoJ3ZsXycgKyBpbmRleCk7XG5cdFx0aWYgKGllKSAkc2NvcGUuZGVzY1tpbmRleF0gPSBpZTtcblx0fTtcblxuXHRzb2NrZXQuZW1pdChcInZhcnNpdHlMaXZlOmdldFwiKTtcblxuXHQkc2NvcGUudHJpZ2dlclZvID0gZnVuY3Rpb24odm8pIHtcblx0XHRzb2NrZXQuZW1pdCgndmFyc2l0eUxpdmU6dm8nLCB2byk7XG5cdH07XG5cblx0JHNjb3BlLmhpZGVWbyA9IGZ1bmN0aW9uKCkge1xuXHRcdHNvY2tldC5lbWl0KCd2YXJzaXR5TGl2ZTp2bycsIDIpO1xuXHR9O1xuXG5cdCRzY29wZS50cmlnZ2VySWdjID0gZnVuY3Rpb24oaWdjKSB7XG5cdFx0c29ja2V0LmVtaXQoJ3ZhcnNpdHlMaXZlOmlnYycsIGlnYyk7XG5cdH07XG5cblx0JHNjb3BlLmhpZGVJZ2MgPSBmdW5jdGlvbigpIHtcblx0XHRzb2NrZXQuZW1pdCgndmFyc2l0eUxpdmU6aWdjJywgMilcblx0fTtcblxuXHQkc2NvcGUudHJpZ2dlckx0ID0gZnVuY3Rpb24obHQpIHtcblx0XHRzb2NrZXQuZW1pdCgndmFyc2l0eUxpdmU6bHQnLCBsdCk7XG5cdH07XG5cblx0JHNjb3BlLiR3YXRjaCgndmFyc2l0eUxpdmUnLCBmdW5jdGlvbigpIHtcblx0XHRpZiAoJHNjb3BlLnZhcnNpdHlMaXZlKSB7XG5cdFx0XHRzb2NrZXQuZW1pdChcInZhcnNpdHlMaXZlXCIsICRzY29wZS52YXJzaXR5TGl2ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdldFZhcnNpdHlMaXZlRGF0YSgpO1xuXHRcdH1cblx0fSwgdHJ1ZSk7XG5cblx0ZnVuY3Rpb24gZ2V0VmFyc2l0eUxpdmVEYXRhKCkge1xuXHRcdHNvY2tldC5lbWl0KFwidmFyc2l0eUxpdmU6Z2V0XCIpO1xuXHR9O1xuXG5cdCRzY29wZS5zdG9yZUVudHJpZXMgPSBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpbmRleCBpbiAkc2NvcGUuZGVzYykge1xuXHRcdFx0bG9jYWxTdG9yYWdlU2VydmljZS5zZXQoJ3ZsXycgKyBpbmRleCwgJHNjb3BlLmRlc2NbaW5kZXhdKTtcblx0XHR9O1xuXHR9O1xuXG5cdCRzY29wZS4kb24oXCIkZGVzdHJveVwiLCAkc2NvcGUuc3RvcmVFbnRyaWVzKTtcblx0JHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9ICRzY29wZS5zdG9yZUVudHJpZXM7XG59KTtcbiJdfQ==
