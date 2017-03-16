app.controller('rugbyCtrl', function($scope, generalSync, $timeout, socket) {
	$timeout(function() {
		socket.emit("rugby:get");
	}, 2000);

	socket.on("rugby", function(state) {
		$scope.state = state;
	});

	$scope.$watch('state', function() {
		generalSync.setNoLive($scope.state.showRugby);
	});
});
