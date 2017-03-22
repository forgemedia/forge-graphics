app.controller('varsityLiveCtrl', function($scope, $interval, $timeout, socket) {
	$scope.dataStores = {
		vo: {},
		igc: {}
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
	socket.on("varsityLive:igc", function(msg) {
		if (msg == 2) {
			$scope.show.igc = false;
			return;
		}
		if ($scope.show.igc) $scope.show.igc = false;
		$scope.dataStores.igc = msg;
		$scope.show.igc = true;
	});
	socket.on("varsityLive:lt", function(msg) {
		if (msg == 2) {
			$scope.show.lt = false;
			return;
		}
		if ($scope.show.lt) $scope.show.lt = false;
		$scope.dataStores.lt = msg;
		$scope.show.lt = true;
		$timeout(function() {
			$scope.show.lt = false;
		}, 10000);
	});
	var tick = function() {
		// socket.emit('varsityLive:get');
	};
	tick();
	$interval(tick, 1000);
});
