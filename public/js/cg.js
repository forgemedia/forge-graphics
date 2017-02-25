var app = angular.module('cgApp', ['socket-io', 'ngAnimate']);

app.controller('generalCtrl', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket){
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

app.controller('lowerThirdsCtrl', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket){
        $scope.tickInterval = 1000;

        socket.on("lowerThirds", function (state) {
            $scope.state = state;
        });

        $scope.$watch('lowerThirds', function() {
            if (!$scope.state) {
                getLowerThirdsData();
            }
        }, true);

        function getLowerThirdsData() {
            socket.emit("lowerThirds:get");
        }

        var tick = function () {
            $timeout(tick, $scope.tickInterval);
        };

        $timeout(tick, $scope.tickInterval);
    }
]);
