app.controller('varsityLiveCtrl', function($scope, $interval, $timeout, socket) {
	$scope.dataStores = {
		vo: {}
	};
	$scope.show = {};
	socket.on("varsityLive", function(msg) {
		$scope.state = msg;
	});
	socket.on("varsityLive:vo", function(msg) {
		if (msg == 2) {
			$scope.show.vo = false;
			return;
		}
		$scope.dataStores.vo = msg;
		// $scope.showOverlay = true;
		$scope.show.vo = true;
	});
	var tick = function() {
		// socket.emit('varsityLive:get');
	};
	tick();
	$interval(tick, 1000);
});
