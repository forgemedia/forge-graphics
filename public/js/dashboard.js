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

        $scope.commitTitleLowerThird = function () {
            $scope.lowerThirds.leftLowerThirdUpperText = $scope.lowerThirds.lltuScratch;
            $scope.lowerThirds.leftLowerThirdLowerText = $scope.lowerThirds.lltlScratch;
            $scope.lowerThirds.rightLowerThirdUpperText = $scope.lowerThirds.rltuScratch;
            $scope.lowerThirds.rightLowerThirdLowerText = $scope.lowerThirds.rltlScratch;
        };

        $scope.commitHeadlineLowerThird = function() {
            $scope.lowerThirds.headlineTop = $scope.lowerThirds.hlTopScratch;
            $scope.lowerThirds.headlineMain = $scope.lowerThirds.hlMainScratch;
        };

        $scope.triggerTitleLowerThird = function () {
            $scope.commitTitleLowerThird();
            $scope.lowerThirds.showTitleLowerThird = true;
            $interval(function () {
                $scope.timeRemaining--;
            }, 1000, 5);
            $timeout(function() {
                $scope.lowerThirds.showTitleLowerThird = false;
            }, 5000);
            $timeout(function() {
                $scope.timeRemaining = 5;
            }, 6000);
        };

        $scope.triggerHeadlineLowerThird = function () {
            $scope.commitHeadlineLowerThird();
            $scope.lowerThirds.showLargeTop = true;
            $scope.lowerThirds.showHeadlineLowerThird = true;

            $timeout(function() {
                $scope.lowerThirds.showLargeTop = false;
            }, 6000);
        };

        $scope.hideHeadlineLowerThird = function () {
            $scope.lowerThirds.showHeadlineLowerThird = false;
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
