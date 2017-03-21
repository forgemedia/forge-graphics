var app = angular.module('cgApp', ['socket-io', 'ngAnimate', 'timer']);

app.service('generalSync',
    function(socket) {
        var syncVars = {};
		var noLive = false;

        socket.emit("general:get");

        socket.on("general", function(state) {
            syncVars = state;
        });

        return {
            sync: function() {
                return syncVars;
            },
			noLive: function() {
				return noLive;
			},
			setNoLive: function(nl, id) {
				noLive = nl;
			}
        };
    }
);
;app.controller('generalCtrl',
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
		$scope.iSocialMediaOutlets = [
			{
				icon: 'facebook-square',
				id: '@ForgeSportPage'
			},
			{
				icon: 'twitter-square',
				id: '@ForgeSport'
			},
			{
				icon: 'instagram',
				id: '@Forge_Sport'
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

		socket.on("general:social", function(msg) {
			$scope.socialMediaOutlets = [];
			$scope.showSocial = true;

			$timeout(function() {
				$scope.iSocialMediaOutlets.forEach(function(d) {
					$scope.socialMediaOutlets.push(d);
				});
			}, 100);

			$timeout(function() {
				// $scope.socialMediaOutlets.forEach(function(d, i) {
				// 	$scope.socialMediaOutlets.splice(i, 1);
				// });
				$scope.socialMediaOutlets.splice(0, $scope.socialMediaOutlets.length);
			}, 8500);

			$timeout(function() {
				$scope.showSocial = false;
			}, 10000);
		})

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
;app.controller('lowerThirdsCtrl',
    function($scope, $timeout, $interval, socket) {
        $scope.tickInterval = 1000;

        // $scope.showTitle = false;
        // $scope.showHeadlineLargeTop = false;
        // $scope.showHeadline = false;
        // $scope.showOngoing = false;
        $scope.titleContent = {};
		$scope.teamsContent = {};
		// $scope.showTeams = true;

		socket.on("lowerThirds:teams", function(msg) {
			$scope.showTeams = true;
			$scope.teamsContent = msg;
			$timeout(function() {
				$scope.showTeams = false;
			}, 10000);
		});

        socket.on("lowerThirds:showTitle", function(msg) {
            if ($scope.showTitle) $scope.showTitle = false;
            // $scope.leftUpperTitleText = msg[0];
            // $scope.leftLowerTitleText = msg[1];
            // $scope.rightUpperTitleText = msg[2];
            // $scope.rightLowerTitleText = msg[3];
            $scope.titleContent = msg;
            $scope.showTitle = true;
            $timeout(function() {
                $scope.showTitle = false;
            }, 10000);
        });

        socket.on("lowerThirds:showHeadline", function(msg) {
            if ($scope.showHeadline) $scope.showHeadline = false;
            $scope.showHeadlineLargeTop = true;
            $scope.headlineTop = msg[0];
            $scope.headlineMain = msg[1];
            $scope.showHeadline = true;
            $timeout(function() {
                $scope.showHeadlineLargeTop = false;
            }, 6000);
        });

        socket.on("lowerThirds:updateHeadline", function(msg) {
            $scope.headlineTop = msg[0];
            $scope.headlineMain = msg[1];
        });

        socket.on("lowerThirds:hideHeadline", function() {
            $scope.showHeadline = false;
        });

        socket.on("lowerThirds:showOngoing", function(msg) {
            if ($scope.showOngoing) $scope.showOngoing = false;
            $scope.ongoingTop = msg[0];
            $scope.ongoingMain = msg[1];
            $scope.showOngoing = true;
        });

        socket.on("lowerThirds:hideOngoing", function() {
            $scope.showOngoing = false;
        });

        socket.on("lowerThirds", function(state) {
            $scope.state = state;
        });

        var tick = function() {
            $timeout(tick, $scope.tickInterval);
        };

        $timeout(tick, $scope.tickInterval);
    }
);
;app.controller('boxingCtrl',
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
;app.controller('rugbyCtrl', function($scope, generalSync, $interval, $timeout, socket) {
	// $scope.state.showRugby = true;
	$scope.Math = window.Math;
	$scope.limiter = 0;

	Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
	};
	// $scope.$broadcast('timer-start');
	// $timeout(function() {
	// 	$scope.$broadcast('timer-reset');
	// }, 100);
	$timeout(function() {
		socket.emit("rugby:get");
	}, 2000);

	socket.on("rugby", function(state) {
		$scope.state = state;
		// console.log(state.time);
	});

	socket.on("rugby:timer", function(msg) {
		// $scope.$broadcast('sw-' + msg);
		switch(msg) {
			case "start":
				$scope.start();
				break;
			case "resume":
				$scope.start();
				break;
			case "reset":
				$scope.reset();
				break;
			case "stop":
				$scope.stop();
				break;
			default:
				break;
		}
	});

	socket.on("rugby:setTimer", function(msg) {
		$scope.stop();
		$scope.stopwatch = msg;
	});

	socket.on("rugby:setLimiter", function(msg) {
		$scope.limiter = msg;
	});

	$scope.stopwatch = 0;
	var timerPromise;

	$scope.start = function() {
		timerPromise = $interval(function() {
			if ($scope.limiter > 0 && $scope.stopwatch == $scope.limiter && $scope.state.hardLimiter) $scope.stop();
			else $scope.stopwatch++;
		}, 1000);
	};

	$scope.stop = function() {
		if (!timerPromise) return;
		$interval.cancel(timerPromise);
		timerPromise = undefined;
	};

	$scope.reset = function() {
		$scope.stop();
		$scope.stopwatch = 0;
	};

	$scope.$watch('state', function() {
		generalSync.setNoLive($scope.state.showRugby);
	});
});
;app.controller('varsityLiveCtrl', function($scope, $interval, $timeout, socket) {
	$scope.dataStores = {
		vo: {},
		igc: {}
	};
	$scope.show = {};
	socket.on("varsityLive", function(msg) {
		$scope.state = msg;
	});
	socket.on("varsityLive:vo", function(msg) {
		if (msg == 2) {
			$scope.show.vo = false;
			return;
		}
		$scope.dataStores.vo = msg;
		// $scope.showOverlay = true;
		$scope.show.vo = true;
	});
	socket.on("varsityLive:igc", function(msg) {
		if (msg == 2) {
			$scope.show.igc = false;
			return;
		}
		if ($scope.show.igc) $scope.show.igc = false;
		$scope.dataStores.igc = msg;
		$scope.show.igc = true;
	});
	var tick = function() {
		// socket.emit('varsityLive:get');
	};
	tick();
	$interval(tick, 1000);
});

//# sourceMappingURL=cg.js.map