var app = angular.module('cgApp', ['socket-io', 'ngAnimate']);

app.controller('generalCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000;

        socket.on("general", function (state) {
            $scope.state = state;
        });

        $scope.$watch('general', function() {
            if (!$scope.state) {
                getGeneralData();
            }
        }, true);

        function getGeneralData() {
            socket.emit("general:get");
        }

        var tick = function () {
            $scope.clock = Date.now();
            $timeout(tick, $scope.tickInterval);
        };

        $timeout(tick, $scope.tickInterval);
    }
]);
