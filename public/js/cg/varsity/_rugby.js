app.controller('rugbyCtrl', function($scope, generalSync, $timeout, socket) {
	// $scope.state.showRugby = true;
	$scope.$broadcast('timer-start');
	$timeout(function() {
		$scope.$broadcast('timer-reset');
	}, 100);
	$timeout(function() {
		socket.emit("rugby:get");
	}, 2000);

	socket.on("rugby", function(state) {
		$scope.state = state;
	});

	socket.on("rugby:timer", function(msg) {
		$scope.$broadcast('timer-' + msg);
	});

	$scope.$watch('state', function() {
		generalSync.setNoLive($scope.state.showRugby);
	});
});
