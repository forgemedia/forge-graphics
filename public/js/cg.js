var app = angular.module('cgApp', ['socket-io', 'ngAnimate']);

app.controller('bugCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("bug", function (state) {
            $scope.state = state;
        });

        $scope.$watch('bug', function() {
            if (!$scope.state) {
                getBugData();
            }
        }, true);

        function getBugData() {
            socket.emit("bug:get");
        }

        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, $scope.tickInterval);
    }
]);
