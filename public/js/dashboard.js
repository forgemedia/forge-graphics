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
            .otherwise({redirectTo: '/general'});
    }
]);

app.controller('generalCGController', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.commitTitleLowerThird = function () {
            $scope.general.leftLowerThirdUpperText = $scope.general.lltuScratch;
            $scope.general.leftLowerThirdLowerText = $scope.general.lltlScratch;
            $scope.general.rightLowerThirdUpperText = $scope.general.rltuScratch;
            $scope.general.rightLowerThirdLowerText = $scope.general.rltlScratch;
        };

        $scope.commitHeadlineLowerThird = function() {
            $scope.general.headlineTop = $scope.general.hlTopScratch;
            $scope.general.headlineMain = $scope.general.hlMainScratch;
        };

        $scope.triggerTitleLowerThird = function () {
            $scope.commitTitleLowerThird();
            $scope.general.showTitleLowerThird = true;
            $timeout(function() {
                $scope.general.showTitleLowerThird = false;
            }, 5000);
        };

        $scope.triggerHeadlineLowerThird = function () {
            $scope.commitHeadlineLowerThird();
            $scope.general.showLargeTop = true;
            $scope.general.showHeadlineLowerThird = true;
            $timeout(function() {
                $scope.general.showLargeTop = false;
            }, 6000);
        }

        $scope.hideHeadlineLowerThird = function () {
            $scope.general.showHeadlineLowerThird = false;
        }

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
