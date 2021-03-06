app.controller('varsityLiveCGController', function($scope, localStorageService, $window, socket) {
	socket.on("varsityLive", function(msg){
		$scope.varsityLive = msg;
	});

	$scope.desc = {
		vo: {
			people: []
		},
		igc: {},
		lt: {}
	};

	$scope.icons = [
		"phone",
		"tv",
		"headphones",
		"futbol-o"
	];

	for (var index in $scope.desc) {
		var ie = localStorageService.get('vl_' + index);
		if (ie) $scope.desc[index] = ie;
	};

	socket.emit("varsityLive:get");

	$scope.triggerVo = function(vo) {
		socket.emit('varsityLive:vo', vo);
	};

	$scope.hideVo = function() {
		socket.emit('varsityLive:vo', 2);
	};

	$scope.triggerIgc = function(igc) {
		socket.emit('varsityLive:igc', igc);
	};

	$scope.hideIgc = function() {
		socket.emit('varsityLive:igc', 2)
	};

	$scope.triggerLt = function(lt) {
		socket.emit('varsityLive:lt', lt);
	};

	$scope.$watch('varsityLive', function() {
		if ($scope.varsityLive) {
			socket.emit("varsityLive", $scope.varsityLive);
		} else {
			getVarsityLiveData();
		}
	}, true);

	function getVarsityLiveData() {
		socket.emit("varsityLive:get");
	};

	$scope.storeEntries = function() {
		for (var index in $scope.desc) {
			localStorageService.set('vl_' + index, $scope.desc[index]);
		};
	};

	$scope.$on("$destroy", $scope.storeEntries);
	$window.onbeforeunload = $scope.storeEntries;
});
