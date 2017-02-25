var app = angular.module('CGDashboardApp', ['ngRoute', 'LocalStorageModule', 'socket-io', 'ui.toggle']);

app.controller('AppCtrl', ['$scope', '$location',
    function($scope, $location){
        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General',
            url: '/general',
            type: 'link'
        });

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link'
        });
    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('forge');

        $routeProvider
            .when("/general", {
                templateUrl: '/templates/general.html',
                controller: 'generalCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/templates/lowerThirds.html',
                controller: 'lowerThirdsCGController'
            })
            .otherwise({redirectTo: '/general'});
    }
]);

app.controller('generalCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("general", function (msg) {
            $scope.general = msg;
        });

        $scope.$watch('general', function() {
            if ($scope.general) {
                socket.emit("general", $scope.general);
            } else {
                getGeneralData();
            }
        }, true);

        function getGeneralData() {
            socket.emit("general:get");
        };
    }
]);

app.controller('lowerThirdsCGController', ['$scope', '$timeout', '$interval', 'socket',
    function($scope, $timeout, $interval, socket){
        $scope.topSelections = [
            "Breaking News",
            "Incoming Result"
        ];

        $scope.timeRemaining = 5;

        $scope.triggerTitleLowerThird = function () {
            socket.emit("lowerThirds:showTitle", [$scope.lltuScratch, $scope.lltlScratch, $scope.rltuScratch, $scope.rltlScratch]);
            $interval(function () {
                $scope.timeRemaining--;
            }, 1000, 5);
            $timeout(function() {
                socket.emit("lowerThirds:hideTitle")
            }, 5000);
            $timeout(function() {
                $scope.timeRemaining = 5;
            }, 6000);
        };

        $scope.triggerHeadlineLowerThird = function () {
            socket.emit("lowerThirds:showHeadline", [$scope.hlTopScratch, $scope.hlMainScratch]);

        };

        $scope.hideHeadlineLowerThird = function () {
            socket.emit("lowerThirds:hideHeadline");
        };

        socket.on("lowerThirds", function (msg) {
            $scope.lowerThirds = msg;
        });

        $scope.$watch('lowerThirds', function() {
            if ($scope.lowerThirds) {
                socket.emit("lowerThirds", $scope.lowerThirds);
            } else {
                getlowerThirdsData();
            }
        }, true);

        function getlowerThirdsData() {
            socket.emit("lowerThirds:get");
        };
    }
]);
