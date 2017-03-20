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

		$scope.clearLocalStorage = function() {
			localStorageService.clearAll();
		};

        $scope.$on("$destroy", $scope.storeEntries);
        $window.onbeforeunload = $scope.storeEntries;
    }
);
