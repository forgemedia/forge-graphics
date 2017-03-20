app.controller('rugbyCGController', function($scope, $rootScope, $window, localStorageService, $filter, socket) {
	$scope.scratch = {};
	$scope.dataStores = {
		timer: {},
		limiter: {}
	};

	for (var index in $scope.dataStores) {
		var ie = localStorageService.get('lt_' + index);
		if (ie) $scope.dataStores[index] = ie;
	};

	socket.on("rugby", function (msg) {
		$scope.rugby = msg;
	});

	socket.emit('teams:get');
	socket.on('teams', function(msg) {
		$scope.teams = msg;
	});

	$scope.scoreAddLeft = function(score) {
		if ($scope.rugby.leftScore + score < 0 && score < 1) $scope.rugby.leftScore = 0;
		else $scope.rugby.leftScore += score;
	};

	$scope.scoreAddRight = function(score) {
		if ($scope.rugby.rightScore + score < 0 && score < 1) $scope.rugby.rightScore = 0;
		else $scope.rugby.rightScore += score;
	};

	$scope.startTimer = function() {
		socket.emit("rugby:timer", 'start');
	};

	$scope.resetTimer = function() {
		socket.emit("rugby:timer", 'reset');
	};

	$scope.stopTimer = function() {
		socket.emit("rugby:timer", 'stop');
	};

	$scope.resumeTimer = function() {
		socket.emit("rugby:timer", 'resume');
	};

	$scope.resetScores = function() {
		$scope.rugby.leftScore = 0;
		$scope.rugby.rightScore = 0;
	};

	$scope.setTeams = function() {
		$scope.rugby.leftPosTeam = $scope.scratch.leftPosTeam;
		$scope.rugby.rightPosTeam = $scope.scratch.rightPosTeam;
	};

	$scope.setTime = function() {
		// console.log($scope.timeSetSecs);
		if (!$scope.dataStores.timer.mins) $scope.dataStores.timer.mins = 0;
		if (!$scope.dataStores.timer.secs) $scope.dataStores.timer.secs = 0;
		socket.emit("rugby:setTimer", (+$scope.dataStores.timer.mins * 60) + +$scope.dataStores.timer.secs);
	};

	$scope.setLimiter = function() {
		if (!$scope.dataStores.limiter.mins) $scope.dataStores.limiter.mins = 0;
		if (!$scope.dataStores.limiter.secs) $scope.dataStores.limiter.secs = 0;
		socket.emit("rugby:setLimiter", (+$scope.dataStores.limiter.mins * 60) + +$scope.dataStores.limiter.secs);
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

	$scope.storeEntries = function() {
		for (var index in $scope.dataStores) {
			localStorageService.set('lt_' + index, $scope.dataStores[index]);
		};
	};

	$scope.$on("$destroy", $scope.storeEntries);
	$window.onbeforeunload = $scope.storeEntries;
});
