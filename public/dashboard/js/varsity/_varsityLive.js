app.controller('varsityLiveCGController', function($scope, socket) {
	socket.on("varsityLive", function(msg){
		$scope.varsityLive = msg;
	});

	socket.emit("varsityLive:get");

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
});
