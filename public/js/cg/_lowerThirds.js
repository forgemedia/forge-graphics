app.controller('lowerThirdsCtrl',
    function($scope, $timeout, $interval, socket) {
        $scope.tickInterval = 1000;

        // $scope.showTitle = false;
        // $scope.showHeadlineLargeTop = false;
        // $scope.showHeadline = false;
        // $scope.showOngoing = false;
        $scope.titleContent = {};
		$scope.teamsContent = {};
		// $scope.showTeams = true;

		socket.on("lowerThirds:teams", function(msg) {
			$scope.showTeams = true;
			$scope.teamsContent = msg;
			$timeout(function() {
				$scope.showTeams = false;
			}, 10000);
		});

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
);
