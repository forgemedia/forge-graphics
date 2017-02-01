var app = angular.module('cgApp', ['socket-io', 'ngAnimate']);

app.controller('generalCtrl', ['$scope', '$timeout', '$interval', '$filter', 'socket',
    function($scope, $timeout, $interval, $filter, socket){
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

        $scope.colonOnBool = true;

        var tick = function () {
            $scope.clock = Date.now();
            $scope.colonOnBool = !$scope.colonOnBool;
            $timeout(tick, $scope.tickInterval);
        };

        $scope.liveToggle = true;

        $interval(function () {
            $scope.liveToggle = !$scope.liveToggle;
        }, 10000);

        $timeout(tick, $scope.tickInterval);
    }
]);
