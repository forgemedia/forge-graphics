app.controller('rugbyCGController', function($scope, socket) {
	socket.on("rugby", function (msg) {
		$scope.rugby = msg;
	});

	$scope.$watch('rugby', function() {
		if ($scope.rugby) {
			socket.emit("rugby", $scope.rugby);
		} else {
			getRugbyData();
		}
	}, true);
	
	function getRugbyData() {
		socket.emit("rugby:get");
	};
});
