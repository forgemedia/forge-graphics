app.controller('rugbyCGController', function($scope, $rootScope, $filter, socket) {
	socket.on("rugby", function (msg) {
		$scope.rugby = msg;
	});

	$scope.teams = [
		'uos',
		'shu'
	];

	$scope.scoreAddLeft = function(score) {
		if ($scope.rugby.leftScore < 1 && score < 1) return;
		$scope.rugby.leftScore += score;
	};

	$scope.scoreAddRight = function(score) {
		if ($scope.rugby.rightScore < 1 && score < 1) return;
		else $scope.rugby.rightScore += score;
	};

	$scope.startTimer = function() {
		socket.emit("rugby:startTimer");
	};

	$scope.resetTimer = function() {
		socket.emit("rugby:resetTimer");
	};

	$scope.stopTimer = function() {
		socket.emit("rugby:stopTimer");
	};

	$scope.resumeTimer = function() {
		socket.emit("rugby:resumeTimer");
	};

	$scope.resetScores = function() {
		$scope.rugby.leftScore = 0;
		$scope.rugby.rightScore = 0;
	};

	$rootScope.$on('teardown', function() {
		$scope.resetScores();
		$scope.resetTimer();
		$scope.rugby.showRugby = false;
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
