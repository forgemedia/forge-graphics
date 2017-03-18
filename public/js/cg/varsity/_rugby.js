app.controller('rugbyCtrl', function($scope, generalSync, $timeout, socket) {
	// $scope.state.showRugby = true;
	$timeout(function() {
		socket.emit("rugby:get");
	}, 2000);

	socket.on("rugby", function(state) {
		$scope.state = state;
	});

	socket.on("rugby:startTimer", function() {
		$scope.$broadcast('timer-resume');
	});

	socket.on("rugby:stopTimer", function() {
		$scope.$broadcast('timer-stop');
	});

	socket.on("rugby:resetTimer", function() {
		$scope.$broadcast('timer-reset');
	});

	socket.on("rugby:resumeTimer", function() {
		$scope.$broadcast('timer-resume');
	});

	$scope.$watch('state', function() {
		generalSync.setNoLive($scope.state.showRugby);
	});
});
