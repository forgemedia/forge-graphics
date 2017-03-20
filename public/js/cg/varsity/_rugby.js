app.controller('rugbyCtrl', function($scope, generalSync, $interval, $timeout, socket) {
	// $scope.state.showRugby = true;
	$scope.Math = window.Math;
	$scope.limiter = 0;

	Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
	};
	// $scope.$broadcast('timer-start');
	// $timeout(function() {
	// 	$scope.$broadcast('timer-reset');
	// }, 100);
	$timeout(function() {
		socket.emit("rugby:get");
	}, 2000);

	socket.on("rugby", function(state) {
		$scope.state = state;
		// console.log(state.time);
	});

	socket.on("rugby:timer", function(msg) {
		// $scope.$broadcast('sw-' + msg);
		switch(msg) {
			case "start":
				$scope.start();
				break;
			case "resume":
				$scope.start();
				break;
			case "reset":
				$scope.reset();
				break;
			case "stop":
				$scope.stop();
				break;
			default:
				break;
		}
	});

	socket.on("rugby:setTimer", function(msg) {
		$scope.stop();
		$scope.stopwatch = msg;
	});

	socket.on("rugby:setLimiter", function(msg) {
		$scope.limiter = msg;
	});

	$scope.stopwatch = 0;
	var timerPromise;

	$scope.start = function() {
		timerPromise = $interval(function() {
			if ($scope.limiter > 0 && $scope.stopwatch == $scope.limiter && $scope.state.hardLimiter) $scope.stop();
			else $scope.stopwatch++;
		}, 1000);
	};

	$scope.stop = function() {
		if (!timerPromise) return;
		$interval.cancel(timerPromise);
		timerPromise = undefined;
	};

	$scope.reset = function() {
		$scope.stop();
		$scope.stopwatch = 0;
	};

	$scope.$watch('state', function() {
		generalSync.setNoLive($scope.state.showRugby);
	});
});
