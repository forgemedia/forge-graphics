app.controller('boxingCtrl',
    function($scope, generalSync, $timeout, socket) {
		$scope.state = {};
		$scope.state.showBoxing = false;

        $timeout(function() {
            socket.emit("boxing:get");
        }, 2000);

        socket.on("boxing", function(state) {
            $scope.state = state;
        });

        $scope.$watch('state', function() {
            generalSync.setNoLive($scope.state.showBoxing);
        });

        socket.on("boxing:resetTimer", function() {
            $scope.$broadcast('timer-reset');
        });

        socket.on("boxing:startTimer", function() {
            $scope.$broadcast('timer-start');
        });
    }
);
