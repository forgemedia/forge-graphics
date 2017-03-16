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
