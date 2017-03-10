var app = angular.module('cgApp', ['socket-io', 'ngAnimate']);

app.controller('generalCtrl', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket) {
        $scope.tickInterval = 1000;

        socket.emit("general:get");

        socket.on("general", function(state) {
            $scope.state = state;
        });

        socket.on("general:resetcg", function() {
            location.reload();
        });

        // $scope.$watch('general', function() {
        //     if (!$scope.state) {
        //         getGeneralData();
        //     }
        // }, true);
        //
        // function getGeneralData() {
        //     socket.emit("general:get");
        // }

        $scope.colonOnBool = true;

        var tick = function() {
            $scope.clock = Date.now();
            $scope.colonOnBool = !$scope.colonOnBool;
            $timeout(tick, $scope.tickInterval);
        };

        $scope.showVotesGraph = false;
		$scope.showFinalGraph = false;
		$scope.curWinner = "";
		$scope.curPos = "";
		$scope.round = "";

        socket.on("general:showVotesGraph", function(msg) {
			$scope.curWinner = msg[2];
			$scope.curPos = msg[1];
            d3.csv("/chartdata/" + msg[0], type, function(error, data) {
				console.log("AAA");
				$scope.round = "First";
	            $scope.showVotesGraph = true;
                barChartVotes("#bc1", data, error, false);
                // barChartVotes("#bc2", data, error, true);
				$timeout(function() {
					$scope.showVotesGraph = false;
					$scope.round = "Final";
					$scope.showFinalGraph = true;
	                // $scope.showVotesGraph = false;
	                angular.element(document.querySelector('#bc1')).empty();
					// $scope.showVotesGraph = true;
	                barChartVotes("#bc2", data, error, true);

	            }, 10000);
				$timeout(function() {
					$scope.showFinalGraph = false;
					angular.element(document.querySelector('#bc2')).empty();
				}, 20000);
            });
        });

		socket.on("general:destroyVotesGraph", function() {
			$scope.showVotesGraph = false;
			$scope.showFinalGraph = false;
			angular.element(document.querySelector('#bc1')).empty();
			angular.element(document.querySelector('#bc2')).empty();
		});

        $scope.liveToggle = true;

        // $scope.tickerItems = [
        //
        // ];

        $interval(function() {
            $scope.liveToggle = !$scope.liveToggle;
        }, 2000);

        $timeout(tick, $scope.tickInterval);
    }
]);

app.controller('lowerThirdsCtrl', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket) {
        $scope.tickInterval = 1000;

        $scope.showTitle = false;
        $scope.showHeadlineLargeTop = false;
        $scope.showHeadline = false;
        $scope.showOngoing = false;

        socket.on("lowerThirds:showTitle", function(msg) {
            if ($scope.showTitle) $scope.showTitle = false;
            $scope.leftUpperTitleText = msg[0];
            $scope.leftLowerTitleText = msg[1];
            $scope.rightUpperTitleText = msg[2];
            $scope.rightLowerTitleText = msg[3];
            $scope.showTitle = true;
            $timeout(function() {
                $scope.showTitle = false;
            }, 10000);
        });

        socket.on("lowerThirds:showHeadline", function(msg) {
            if ($scope.showHeadline) $scope.showHeadline = false;
            $scope.showHeadlineLargeTop = true;
            $scope.headlineTop = msg[0];
            $scope.headlineMain = msg[1];
            $scope.showHeadline = true;
            $timeout(function() {
                $scope.showHeadlineLargeTop = false;
            }, 6000);
        });

        socket.on("lowerThirds:updateHeadline", function(msg) {
            $scope.headlineTop = msg[0];
            $scope.headlineMain = msg[1];
        });

        socket.on("lowerThirds:hideHeadline", function() {
            $scope.showHeadline = false;
        });

        socket.on("lowerThirds:showOngoing", function(msg) {
            if ($scope.showOngoing) $scope.showOngoing = false;
            $scope.ongoingTop = msg[0];
            $scope.ongoingMain = msg[1];
            $scope.showOngoing = true;
        });

        socket.on("lowerThirds:hideOngoing", function() {
            $scope.showOngoing = false;
        });

        socket.on("lowerThirds", function(state) {
            $scope.state = state;
        });

        var tick = function() {
            $timeout(tick, $scope.tickInterval);
        };

        $timeout(tick, $scope.tickInterval);
    }
]);
