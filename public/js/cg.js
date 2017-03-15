var app = angular.module('cgApp', ['socket-io', 'ngAnimate', 'timer']);

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

		$scope.htNumber = 0;

		$scope.hashtags = [
			{
				hashtag: '@ForgeSport',
				classes: []
			},
			{
				hashtag: '#suvarsity',
				classes: ['uos']
			},
			{
				hashtag: '#hallamvarsity',
				classes: ['shu']
			}
		];

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

        $scope.liveToggle = true;

        $interval(function() {
            $scope.liveToggle = !$scope.liveToggle;
        }, 10000);

		$interval(function() {
			if ($scope.htNumber == $scope.hashtags.length - 1) $scope.htNumber = 0;
			else $scope.htNumber++;
		}, 20000);

        $timeout(tick, $scope.tickInterval);
    }
]);

app.controller('lowerThirdsCtrl', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket) {
        $scope.tickInterval = 1000;

        // $scope.showTitle = false;
        // $scope.showHeadlineLargeTop = false;
        // $scope.showHeadline = false;
        // $scope.showOngoing = false;
		$scope.titleContent = {};

        socket.on("lowerThirds:showTitle", function(msg) {
            if ($scope.showTitle) $scope.showTitle = false;
            // $scope.leftUpperTitleText = msg[0];
            // $scope.leftLowerTitleText = msg[1];
            // $scope.rightUpperTitleText = msg[2];
            // $scope.rightLowerTitleText = msg[3];
			$scope.titleContent = msg;
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

app.controller('boxingCtrl', ['$scope', 'socket',
	function($scope, socket) {
        socket.emit("boxing:get");

        socket.on("boxing", function(state) {
            $scope.state = state;
        });

		socket.on("boxing:resetTimer", function() {
			$scope.$broadcast('timer-reset');
		});

		socket.on("boxing:startTimer", function() {
			 $scope.$broadcast('timer-start');
		});
	}
]);
