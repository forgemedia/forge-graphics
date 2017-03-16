app.controller('lowerThirdsCGController',
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
