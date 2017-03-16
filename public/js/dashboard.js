var app = angular.module('CGDashboardApp', ['ngRoute', 'LocalStorageModule', 'socket-io', 'ui.toggle']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

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
			name: 'Boxing',
			url: '/boxing',
			type: 'link'
		});
    }
]);

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
            .otherwise({redirectTo: '/general'});
    }
);

app.controller('generalCGController',
    function($scope, localStorageService, socket){
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

app.controller('lowerThirdsCGController',
    function($scope, localStorageService, $timeout, $interval, $window, socket){
        var titleStored = localStorageService.get('lt_title');
        var headlineStored = localStorageService.get('lt_headline');
        var ongoingStored = localStorageService.get('lt_ongoing');

        if (titleStored === null) $scope.ltTitleDashEntries = {};
        else $scope.ltTitleDashEntries = titleStored;

        if (headlineStored === null) $scope.ltHeadlineDashEntries = [];
        else $scope.ltHeadlineDashEntries = headlineStored;

        if (ongoingStored === null) $scope.ltOngoingDashEntries = [];
        else $scope.ltOngoingDashEntries = ongoingStored;

        $scope.topSelections = [
            "Breaking News",
            "Incoming Result"
        ];

        // $scope.hlTopScratch = $scope.topSelections[0];

        // $scope.timeRemaining = 10;

        $scope.triggerTitleLowerThird = function () {
            socket.emit("lowerThirds:showTitle", $scope.ltTitleDashEntries);
            // $interval(function () {
            //     $scope.timeRemaining--;
            // }, 1000, 10);
            // $timeout(function() {
            //     $scope.timeRemaining = 10;
            // }, 11000);
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
        };

		$scope.clearLocalStorage = function() {
			localStorageService.clearAll();
		};

        $scope.$on("$destroy", $scope.storeEntries);
        $window.onbeforeunload = $scope.storeEntries;
    }
);

app.controller('boxingCGController',
	function($scope, $timeout, socket) {
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

        function getBoxingData() {
            socket.emit("boxing:get");
        };
	}
);
