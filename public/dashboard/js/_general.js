app.controller('generalCGController',
    function($scope, $rootScope, $interval, $timeout, localStorageService, $window, socket) {
        $scope.general = {
            tickerItems: [],
            cTickerItems: []
        };

		$scope.cuIcons = [
			'tv',
			'headphones',
			'soccer-ball-o'
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
