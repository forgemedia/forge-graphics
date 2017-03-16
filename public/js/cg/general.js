app.controller('generalCtrl',
    function($scope, generalSync, $timeout, $filter, $interval, socket) {
        $scope.tickInterval = 1000;

        $scope.state = {};

        socket.on("general:resetcg", function() {
			$scope.state.showLogo = false;
			$timeout(function() {
	            location.reload();
			}, 2000);
        });

        var clockText = $filter('date')(Date.now(), "HH:mm");

        // $scope.showVotesGraph = false;
        // $scope.showFinalGraph = false;
        // $scope.curWinner = "";
        // $scope.curPos = "";
        // $scope.round = "";

        $scope.htNumber = 0;
        $scope.hashtags = [{
                hashtag: '@ForgeSport',
                classes: []
            },
            {
                hashtag: '#suvarsity',
                classes: ['uos']
            },
            {
                hashtag: '#hallamvarsity',
                classes: ['shu']
            }
        ];

        $scope.liNumber = 0;
        $scope.liveItems = [{
                text: 'LIVE',
                classes: ['altLive']
            },
            {
                text: clockText,
                classes: []
            }
        ];

        var tick = function() {
            $scope.state = generalSync.sync();
			$scope.noLive = generalSync.noLive();
            $scope.clockText = $scope.liveItems[1].text = $filter('date')(Date.now(), "HH:mm");
            $timeout(tick, $scope.tickInterval);
        };

        $interval(function() {
            // $scope.liveToggle = !$scope.liveToggle;
            if ($scope.liNumber == $scope.liveItems.length - 1) $scope.liNumber = 0;
            else $scope.liNumber++;
        }, 10000);

        $interval(function() {
            if ($scope.htNumber == $scope.hashtags.length - 1) $scope.htNumber = 0;
            else $scope.htNumber++;
        }, 20000);

        $timeout(tick, $scope.tickInterval);
    }
);
