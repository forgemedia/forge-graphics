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
;
app.controller('generalCtrl',
    function($scope, generalSync, $timeout, $filter, $interval, socket) {
        $scope.tickInterval = 1000;

        $scope.state = {};
		$scope.score = {};

		socket.emit("hashtags:get");
		socket.emit("socialMediaOutlets:get");

		socket.on("hashtags", function(msg) {
			$scope.hashtags = msg;
		});

		socket.on("socialMediaOutlets", function(msg) {
			$scope.iSocialMediaOutlets = msg;
		});

        socket.on("general:resetcg", function() {
			$scope.state.showLogo = false;
			$timeout(function() {
	            location.reload();
			}, 2000);
        });

		// socket.on("general:comingUp", function(msg) {
		// 	$scope.dataStores.comingUp = msg;
		// 	$scope.showComingUp = true;
		// 	$timeout(function() {
		// 		$scope.showComingUp = false;
		// 	}, 8000);
		// });

		socket.on("general:showScore", function(msg){
			$scope.score = $scope.state.score;
			$scope.showScoreGraphic = true;

			$timeout(function() {
				$scope.showScoreGraphic = false;
			}, 10000);
		});

		socket.on("general:comingUp", function(msg) {
			$scope.comingUp = [];
			$scope.showComingUp = true;

			$timeout(function() {
				msg.forEach(function(d) {
					$scope.comingUp.push(d);
				});
			}, 100);

			$timeout(function() {
				$scope.comingUp.splice(0, $scope.comingUp.length);
			}, 8500);

			$timeout(function() {
				$scope.showComingUp = false;
			}, 10000);
		})

        var clockText = $filter('date')(Date.now(), "HH:mm");

        $scope.htNumber = 0;

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
				$scope.socialMediaOutlets.splice(0, $scope.socialMediaOutlets.length);
			}, 8500);

			$timeout(function() {
				$scope.showSocial = false;
			}, 10000);
		});

        var tick = function() {
            $scope.state = generalSync.sync();
			$scope.noLive = generalSync.noLive();
            $scope.clockText = $scope.liveItems[1].text = $filter('date')(Date.now(), "HH:mm");
            $timeout(tick, $scope.tickInterval);
        };

        $interval(function() {
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
;
app.controller('lowerThirdsCtrl',
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
;
var gradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15)), ";

var colourScale = d3.scaleLinear()
    .interpolate(d3.interpolateRgb)
    .range([d3.rgb("#00222b"), d3.rgb('#26bae1')]);
var colourDelayFunction = function (d, i) {
	return (i * textInterval) + (textDelay * 0.75);
};

var textDelay = 2000;
var textInterval = 75;
var textDelayFunction = function (d, i) {
	return (i * textInterval) + textDelay;
};

var voteReturn = function(d, voteCount, final) {
	var value = final ? d.final : d.votes;
	if (value == 0) return "";
	return Math.round((value / voteCount) * 1000) / 10 + "%";
}

function barChartVotes(ax, data, error, final) {
	if (error) throw error;

	var a = d3.select(ax).selectAll("div");

	data.sort(function(a, b) {
		return final ? (a.final - b.final) : (a.votes - b.votes);
	}).reverse();

	console.log(data);
    var dcScale = colourScale.domain([0, final ? d3.max(data).final : d3.max(data).votes]);
	var lScale = d3.scaleLinear().domain([0, final ? d3.max(data).final : d3.max(data).votes]).range([0, 65]);

	var voteCount = 0;
	data.forEach(function(d, i) {
		// console.log("voteCount: " + voteCount);
		// console.log(d.votes);
		voteCount += parseInt(final? d.final : d.votes);
	});
		// console.log(a);
		var x = a.data(data)
		.enter().append("div").attr("class", "barContainer");
		var b = x.append("div");
			b.attr("class", "bar")
			.style("width", "0px")
			.style("background", gradient + "#26bae1")
			.style("opacity", 0)
			.transition()
			.ease(d3.easeBack)
			.duration(1000)
			.style("opacity", 1)
			.duration(500)
			.delay(500)
			.style("width", function(d) { return lScale(final? d.final : d.votes) + "vw"; });
			b.transition().
			style("background", function(d, i) {
				return "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15)), " + dcScale(d.votes);
			})
			.delay(colourDelayFunction);
			x.append("div")
				.attr("class", "name")
				.text(function(d) { return d.name; })
				.style("opacity", 0)
				.transition()
				.style("opacity", 1)
				.delay(textDelayFunction);
			b.append("span")
				.attr("class", "tally")
				.text(function(d) { return final? d.final : d.votes; })
				.style("opacity", 0)
				.transition()
				.style("opacity", 1)
				.delay(textDelayFunction);
			b.append("span")
				.attr("class", "percentage")
				.text(function(d) { return voteReturn(d, voteCount, final); })
				.style("opacity", 0)
				.transition()
				.style("opacity", 0.75)
				.delay(textDelayFunction);
}

function type(d) {
    d.votes = +d.votes;
    return d;
}
;
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
;
app.controller('rugbyCtrl', function($scope, generalSync, $interval, $timeout, socket) {
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
		if (timerPromise) return;
		timerPromise = $interval(function() {
			if (($scope.limiter > 0 && $scope.stopwatch == $scope.limiter && $scope.state.hardLimiter) || ($scope.state.isCountdown && $scope.stopwatch < 1)) $scope.stop();
			else $scope.stopwatch+=$scope.state.isCountdown?-1:1;
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
;
app.controller('varsityLiveCtrl', function($scope, $interval, $timeout, socket) {
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
	socket.on("varsityLive:lt", function(msg) {
		if (msg == 2) {
			$scope.show.lt = false;
			return;
		}
		if ($scope.show.lt) $scope.show.lt = false;
		$scope.dataStores.lt = msg;
		$scope.show.lt = true;
		$timeout(function() {
			$scope.show.lt = false;
		}, 10000);
	});
	var tick = function() {
		// socket.emit('varsityLive:get');
	};
	tick();
	$interval(tick, 1000);
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9jZy5qcyIsImNnL19nZW5lcmFsLmpzIiwiY2cvX2xvd2VyVGhpcmRzLmpzIiwiY2cvZWxlY3Rpb25zL19jaGFydC5qcyIsImNnL3ZhcnNpdHkvX2JveGluZy5qcyIsImNnL3ZhcnNpdHkvX3J1Z2J5LmpzIiwiY2cvdmFyc2l0eS9fdmFyc2l0eUxpdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNnLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdjZ0FwcCcsIFsnc29ja2V0LWlvJywgJ25nQW5pbWF0ZScsICd0aW1lciddKTtcblxuYXBwLnNlcnZpY2UoJ2dlbmVyYWxTeW5jJyxcbiAgICBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgdmFyIHN5bmNWYXJzID0ge307XG5cdFx0dmFyIG5vTGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIHNvY2tldC5lbWl0KFwiZ2VuZXJhbDpnZXRcIik7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwiZ2VuZXJhbFwiLCBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICAgICAgc3luY1ZhcnMgPSBzdGF0ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN5bmM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzeW5jVmFycztcbiAgICAgICAgICAgIH0sXG5cdFx0XHRub0xpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbm9MaXZlO1xuXHRcdFx0fSxcblx0XHRcdHNldE5vTGl2ZTogZnVuY3Rpb24obmwsIGlkKSB7XG5cdFx0XHRcdG5vTGl2ZSA9IG5sO1xuXHRcdFx0fVxuICAgICAgICB9O1xuICAgIH1cbik7XG4iLCJhcHAuY29udHJvbGxlcignZ2VuZXJhbEN0cmwnLFxuICAgIGZ1bmN0aW9uKCRzY29wZSwgZ2VuZXJhbFN5bmMsICR0aW1lb3V0LCAkZmlsdGVyLCAkaW50ZXJ2YWwsIHNvY2tldCkge1xuICAgICAgICAkc2NvcGUudGlja0ludGVydmFsID0gMTAwMDtcblxuICAgICAgICAkc2NvcGUuc3RhdGUgPSB7fTtcblx0XHQkc2NvcGUuc2NvcmUgPSB7fTtcblxuXHRcdHNvY2tldC5lbWl0KFwiaGFzaHRhZ3M6Z2V0XCIpO1xuXHRcdHNvY2tldC5lbWl0KFwic29jaWFsTWVkaWFPdXRsZXRzOmdldFwiKTtcblxuXHRcdHNvY2tldC5vbihcImhhc2h0YWdzXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0JHNjb3BlLmhhc2h0YWdzID0gbXNnO1xuXHRcdH0pO1xuXG5cdFx0c29ja2V0Lm9uKFwic29jaWFsTWVkaWFPdXRsZXRzXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0JHNjb3BlLmlTb2NpYWxNZWRpYU91dGxldHMgPSBtc2c7XG5cdFx0fSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwiZ2VuZXJhbDpyZXNldGNnXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnN0YXRlLnNob3dMb2dvID0gZmFsc2U7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHR9LCAyMDAwKTtcbiAgICAgICAgfSk7XG5cblx0XHQvLyBzb2NrZXQub24oXCJnZW5lcmFsOmNvbWluZ1VwXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdC8vIFx0JHNjb3BlLmRhdGFTdG9yZXMuY29taW5nVXAgPSBtc2c7XG5cdFx0Ly8gXHQkc2NvcGUuc2hvd0NvbWluZ1VwID0gdHJ1ZTtcblx0XHQvLyBcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdC8vIFx0XHQkc2NvcGUuc2hvd0NvbWluZ1VwID0gZmFsc2U7XG5cdFx0Ly8gXHR9LCA4MDAwKTtcblx0XHQvLyB9KTtcblxuXHRcdHNvY2tldC5vbihcImdlbmVyYWw6c2hvd1Njb3JlXCIsIGZ1bmN0aW9uKG1zZyl7XG5cdFx0XHQkc2NvcGUuc2NvcmUgPSAkc2NvcGUuc3RhdGUuc2NvcmU7XG5cdFx0XHQkc2NvcGUuc2hvd1Njb3JlR3JhcGhpYyA9IHRydWU7XG5cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuc2hvd1Njb3JlR3JhcGhpYyA9IGZhbHNlO1xuXHRcdFx0fSwgMTAwMDApO1xuXHRcdH0pO1xuXG5cdFx0c29ja2V0Lm9uKFwiZ2VuZXJhbDpjb21pbmdVcFwiLCBmdW5jdGlvbihtc2cpIHtcblx0XHRcdCRzY29wZS5jb21pbmdVcCA9IFtdO1xuXHRcdFx0JHNjb3BlLnNob3dDb21pbmdVcCA9IHRydWU7XG5cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRtc2cuZm9yRWFjaChmdW5jdGlvbihkKSB7XG5cdFx0XHRcdFx0JHNjb3BlLmNvbWluZ1VwLnB1c2goZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgMTAwKTtcblxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRzY29wZS5jb21pbmdVcC5zcGxpY2UoMCwgJHNjb3BlLmNvbWluZ1VwLmxlbmd0aCk7XG5cdFx0XHR9LCA4NTAwKTtcblxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRzY29wZS5zaG93Q29taW5nVXAgPSBmYWxzZTtcblx0XHRcdH0sIDEwMDAwKTtcblx0XHR9KVxuXG4gICAgICAgIHZhciBjbG9ja1RleHQgPSAkZmlsdGVyKCdkYXRlJykoRGF0ZS5ub3coKSwgXCJISDptbVwiKTtcblxuICAgICAgICAkc2NvcGUuaHROdW1iZXIgPSAwO1xuXG4gICAgICAgICRzY29wZS5saU51bWJlciA9IDA7XG4gICAgICAgICRzY29wZS5saXZlSXRlbXMgPSBbe1xuICAgICAgICAgICAgICAgIHRleHQ6ICdMSVZFJyxcbiAgICAgICAgICAgICAgICBjbGFzc2VzOiBbJ2FsdExpdmUnXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBjbG9ja1RleHQsXG4gICAgICAgICAgICAgICAgY2xhc3NlczogW11cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcblxuXHRcdHNvY2tldC5vbihcImdlbmVyYWw6c29jaWFsXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdFx0JHNjb3BlLnNvY2lhbE1lZGlhT3V0bGV0cyA9IFtdO1xuXHRcdFx0JHNjb3BlLnNob3dTb2NpYWwgPSB0cnVlO1xuXG5cdFx0XHQkdGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0JHNjb3BlLmlTb2NpYWxNZWRpYU91dGxldHMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG5cdFx0XHRcdFx0JHNjb3BlLnNvY2lhbE1lZGlhT3V0bGV0cy5wdXNoKGQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIDEwMCk7XG5cblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuc29jaWFsTWVkaWFPdXRsZXRzLnNwbGljZSgwLCAkc2NvcGUuc29jaWFsTWVkaWFPdXRsZXRzLmxlbmd0aCk7XG5cdFx0XHR9LCA4NTAwKTtcblxuXHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRzY29wZS5zaG93U29jaWFsID0gZmFsc2U7XG5cdFx0XHR9LCAxMDAwMCk7XG5cdFx0fSk7XG5cbiAgICAgICAgdmFyIHRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZSA9IGdlbmVyYWxTeW5jLnN5bmMoKTtcblx0XHRcdCRzY29wZS5ub0xpdmUgPSBnZW5lcmFsU3luYy5ub0xpdmUoKTtcbiAgICAgICAgICAgICRzY29wZS5jbG9ja1RleHQgPSAkc2NvcGUubGl2ZUl0ZW1zWzFdLnRleHQgPSAkZmlsdGVyKCdkYXRlJykoRGF0ZS5ub3coKSwgXCJISDptbVwiKTtcbiAgICAgICAgICAgICR0aW1lb3V0KHRpY2ssICRzY29wZS50aWNrSW50ZXJ2YWwpO1xuICAgICAgICB9O1xuXG4gICAgICAgICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUubGlOdW1iZXIgPT0gJHNjb3BlLmxpdmVJdGVtcy5sZW5ndGggLSAxKSAkc2NvcGUubGlOdW1iZXIgPSAwO1xuICAgICAgICAgICAgZWxzZSAkc2NvcGUubGlOdW1iZXIrKztcbiAgICAgICAgfSwgMTAwMDApO1xuXG4gICAgICAgICRpbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaHROdW1iZXIgPT0gJHNjb3BlLmhhc2h0YWdzLmxlbmd0aCAtIDEpICRzY29wZS5odE51bWJlciA9IDA7XG4gICAgICAgICAgICBlbHNlICRzY29wZS5odE51bWJlcisrO1xuICAgICAgICB9LCAyMDAwMCk7XG5cbiAgICAgICAgJHRpbWVvdXQodGljaywgJHNjb3BlLnRpY2tJbnRlcnZhbCk7XG4gICAgfVxuKTtcbiIsImFwcC5jb250cm9sbGVyKCdsb3dlclRoaXJkc0N0cmwnLFxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRpbnRlcnZhbCwgc29ja2V0KSB7XG4gICAgICAgICRzY29wZS50aWNrSW50ZXJ2YWwgPSAxMDAwO1xuXG4gICAgICAgIC8vICRzY29wZS5zaG93VGl0bGUgPSBmYWxzZTtcbiAgICAgICAgLy8gJHNjb3BlLnNob3dIZWFkbGluZUxhcmdlVG9wID0gZmFsc2U7XG4gICAgICAgIC8vICRzY29wZS5zaG93SGVhZGxpbmUgPSBmYWxzZTtcbiAgICAgICAgLy8gJHNjb3BlLnNob3dPbmdvaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS50aXRsZUNvbnRlbnQgPSB7fTtcblx0XHQkc2NvcGUudGVhbXNDb250ZW50ID0ge307XG5cdFx0Ly8gJHNjb3BlLnNob3dUZWFtcyA9IHRydWU7XG5cblx0XHRzb2NrZXQub24oXCJsb3dlclRoaXJkczp0ZWFtc1wiLCBmdW5jdGlvbihtc2cpIHtcblx0XHRcdCRzY29wZS5zaG93VGVhbXMgPSB0cnVlO1xuXHRcdFx0JHNjb3BlLnRlYW1zQ29udGVudCA9IG1zZztcblx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuc2hvd1RlYW1zID0gZmFsc2U7XG5cdFx0XHR9LCAxMDAwMCk7XG5cdFx0fSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG93ZXJUaGlyZHM6c2hvd1RpdGxlXCIsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5zaG93VGl0bGUpICRzY29wZS5zaG93VGl0bGUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vICRzY29wZS5sZWZ0VXBwZXJUaXRsZVRleHQgPSBtc2dbMF07XG4gICAgICAgICAgICAvLyAkc2NvcGUubGVmdExvd2VyVGl0bGVUZXh0ID0gbXNnWzFdO1xuICAgICAgICAgICAgLy8gJHNjb3BlLnJpZ2h0VXBwZXJUaXRsZVRleHQgPSBtc2dbMl07XG4gICAgICAgICAgICAvLyAkc2NvcGUucmlnaHRMb3dlclRpdGxlVGV4dCA9IG1zZ1szXTtcbiAgICAgICAgICAgICRzY29wZS50aXRsZUNvbnRlbnQgPSBtc2c7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd1RpdGxlID0gdHJ1ZTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zaG93VGl0bGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG93ZXJUaGlyZHM6c2hvd0hlYWRsaW5lXCIsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5zaG93SGVhZGxpbmUpICRzY29wZS5zaG93SGVhZGxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5zaG93SGVhZGxpbmVMYXJnZVRvcCA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUuaGVhZGxpbmVUb3AgPSBtc2dbMF07XG4gICAgICAgICAgICAkc2NvcGUuaGVhZGxpbmVNYWluID0gbXNnWzFdO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dIZWFkbGluZSA9IHRydWU7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0hlYWRsaW5lTGFyZ2VUb3AgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIDYwMDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oXCJsb3dlclRoaXJkczp1cGRhdGVIZWFkbGluZVwiLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICAgICRzY29wZS5oZWFkbGluZVRvcCA9IG1zZ1swXTtcbiAgICAgICAgICAgICRzY29wZS5oZWFkbGluZU1haW4gPSBtc2dbMV07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5vbihcImxvd2VyVGhpcmRzOmhpZGVIZWFkbGluZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5zaG93SGVhZGxpbmUgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG93ZXJUaGlyZHM6c2hvd09uZ29pbmdcIiwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLnNob3dPbmdvaW5nKSAkc2NvcGUuc2hvd09uZ29pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5vbmdvaW5nVG9wID0gbXNnWzBdO1xuICAgICAgICAgICAgJHNjb3BlLm9uZ29pbmdNYWluID0gbXNnWzFdO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPbmdvaW5nID0gdHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG93ZXJUaGlyZHM6aGlkZU9uZ29pbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd09uZ29pbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0Lm9uKFwibG93ZXJUaGlyZHNcIiwgZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHRpbWVvdXQodGljaywgJHNjb3BlLnRpY2tJbnRlcnZhbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHRpbWVvdXQodGljaywgJHNjb3BlLnRpY2tJbnRlcnZhbCk7XG4gICAgfVxuKTtcbiIsInZhciBncmFkaWVudCA9IFwibGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgcmdiYSgwLCAwLCAwLCAwKSwgcmdiYSgwLCAwLCAwLCAwLjE1KSksIFwiO1xuXG52YXIgY29sb3VyU2NhbGUgPSBkMy5zY2FsZUxpbmVhcigpXG4gICAgLmludGVycG9sYXRlKGQzLmludGVycG9sYXRlUmdiKVxuICAgIC5yYW5nZShbZDMucmdiKFwiIzAwMjIyYlwiKSwgZDMucmdiKCcjMjZiYWUxJyldKTtcbnZhciBjb2xvdXJEZWxheUZ1bmN0aW9uID0gZnVuY3Rpb24gKGQsIGkpIHtcblx0cmV0dXJuIChpICogdGV4dEludGVydmFsKSArICh0ZXh0RGVsYXkgKiAwLjc1KTtcbn07XG5cbnZhciB0ZXh0RGVsYXkgPSAyMDAwO1xudmFyIHRleHRJbnRlcnZhbCA9IDc1O1xudmFyIHRleHREZWxheUZ1bmN0aW9uID0gZnVuY3Rpb24gKGQsIGkpIHtcblx0cmV0dXJuIChpICogdGV4dEludGVydmFsKSArIHRleHREZWxheTtcbn07XG5cbnZhciB2b3RlUmV0dXJuID0gZnVuY3Rpb24oZCwgdm90ZUNvdW50LCBmaW5hbCkge1xuXHR2YXIgdmFsdWUgPSBmaW5hbCA/IGQuZmluYWwgOiBkLnZvdGVzO1xuXHRpZiAodmFsdWUgPT0gMCkgcmV0dXJuIFwiXCI7XG5cdHJldHVybiBNYXRoLnJvdW5kKCh2YWx1ZSAvIHZvdGVDb3VudCkgKiAxMDAwKSAvIDEwICsgXCIlXCI7XG59XG5cbmZ1bmN0aW9uIGJhckNoYXJ0Vm90ZXMoYXgsIGRhdGEsIGVycm9yLCBmaW5hbCkge1xuXHRpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG5cdHZhciBhID0gZDMuc2VsZWN0KGF4KS5zZWxlY3RBbGwoXCJkaXZcIik7XG5cblx0ZGF0YS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRyZXR1cm4gZmluYWwgPyAoYS5maW5hbCAtIGIuZmluYWwpIDogKGEudm90ZXMgLSBiLnZvdGVzKTtcblx0fSkucmV2ZXJzZSgpO1xuXG5cdGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIHZhciBkY1NjYWxlID0gY29sb3VyU2NhbGUuZG9tYWluKFswLCBmaW5hbCA/IGQzLm1heChkYXRhKS5maW5hbCA6IGQzLm1heChkYXRhKS52b3Rlc10pO1xuXHR2YXIgbFNjYWxlID0gZDMuc2NhbGVMaW5lYXIoKS5kb21haW4oWzAsIGZpbmFsID8gZDMubWF4KGRhdGEpLmZpbmFsIDogZDMubWF4KGRhdGEpLnZvdGVzXSkucmFuZ2UoWzAsIDY1XSk7XG5cblx0dmFyIHZvdGVDb3VudCA9IDA7XG5cdGRhdGEuZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJ2b3RlQ291bnQ6IFwiICsgdm90ZUNvdW50KTtcblx0XHQvLyBjb25zb2xlLmxvZyhkLnZvdGVzKTtcblx0XHR2b3RlQ291bnQgKz0gcGFyc2VJbnQoZmluYWw/IGQuZmluYWwgOiBkLnZvdGVzKTtcblx0fSk7XG5cdFx0Ly8gY29uc29sZS5sb2coYSk7XG5cdFx0dmFyIHggPSBhLmRhdGEoZGF0YSlcblx0XHQuZW50ZXIoKS5hcHBlbmQoXCJkaXZcIikuYXR0cihcImNsYXNzXCIsIFwiYmFyQ29udGFpbmVyXCIpO1xuXHRcdHZhciBiID0geC5hcHBlbmQoXCJkaXZcIik7XG5cdFx0XHRiLmF0dHIoXCJjbGFzc1wiLCBcImJhclwiKVxuXHRcdFx0LnN0eWxlKFwid2lkdGhcIiwgXCIwcHhcIilcblx0XHRcdC5zdHlsZShcImJhY2tncm91bmRcIiwgZ3JhZGllbnQgKyBcIiMyNmJhZTFcIilcblx0XHRcdC5zdHlsZShcIm9wYWNpdHlcIiwgMClcblx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdC5lYXNlKGQzLmVhc2VCYWNrKVxuXHRcdFx0LmR1cmF0aW9uKDEwMDApXG5cdFx0XHQuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG5cdFx0XHQuZHVyYXRpb24oNTAwKVxuXHRcdFx0LmRlbGF5KDUwMClcblx0XHRcdC5zdHlsZShcIndpZHRoXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGxTY2FsZShmaW5hbD8gZC5maW5hbCA6IGQudm90ZXMpICsgXCJ2d1wiOyB9KTtcblx0XHRcdGIudHJhbnNpdGlvbigpLlxuXHRcdFx0c3R5bGUoXCJiYWNrZ3JvdW5kXCIsIGZ1bmN0aW9uKGQsIGkpIHtcblx0XHRcdFx0cmV0dXJuIFwibGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgcmdiYSgwLCAwLCAwLCAwKSwgcmdiYSgwLCAwLCAwLCAwLjE1KSksIFwiICsgZGNTY2FsZShkLnZvdGVzKTtcblx0XHRcdH0pXG5cdFx0XHQuZGVsYXkoY29sb3VyRGVsYXlGdW5jdGlvbik7XG5cdFx0XHR4LmFwcGVuZChcImRpdlwiKVxuXHRcdFx0XHQuYXR0cihcImNsYXNzXCIsIFwibmFtZVwiKVxuXHRcdFx0XHQudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLm5hbWU7IH0pXG5cdFx0XHRcdC5zdHlsZShcIm9wYWNpdHlcIiwgMClcblx0XHRcdFx0LnRyYW5zaXRpb24oKVxuXHRcdFx0XHQuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG5cdFx0XHRcdC5kZWxheSh0ZXh0RGVsYXlGdW5jdGlvbik7XG5cdFx0XHRiLmFwcGVuZChcInNwYW5cIilcblx0XHRcdFx0LmF0dHIoXCJjbGFzc1wiLCBcInRhbGx5XCIpXG5cdFx0XHRcdC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZpbmFsPyBkLmZpbmFsIDogZC52b3RlczsgfSlcblx0XHRcdFx0LnN0eWxlKFwib3BhY2l0eVwiLCAwKVxuXHRcdFx0XHQudHJhbnNpdGlvbigpXG5cdFx0XHRcdC5zdHlsZShcIm9wYWNpdHlcIiwgMSlcblx0XHRcdFx0LmRlbGF5KHRleHREZWxheUZ1bmN0aW9uKTtcblx0XHRcdGIuYXBwZW5kKFwic3BhblwiKVxuXHRcdFx0XHQuYXR0cihcImNsYXNzXCIsIFwicGVyY2VudGFnZVwiKVxuXHRcdFx0XHQudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiB2b3RlUmV0dXJuKGQsIHZvdGVDb3VudCwgZmluYWwpOyB9KVxuXHRcdFx0XHQuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcblx0XHRcdFx0LnN0eWxlKFwib3BhY2l0eVwiLCAwLjc1KVxuXHRcdFx0XHQuZGVsYXkodGV4dERlbGF5RnVuY3Rpb24pO1xufVxuXG5mdW5jdGlvbiB0eXBlKGQpIHtcbiAgICBkLnZvdGVzID0gK2Qudm90ZXM7XG4gICAgcmV0dXJuIGQ7XG59XG4iLCJhcHAuY29udHJvbGxlcignYm94aW5nQ3RybCcsXG4gICAgZnVuY3Rpb24oJHNjb3BlLCBnZW5lcmFsU3luYywgJHRpbWVvdXQsIHNvY2tldCkge1xuXHRcdCRzY29wZS5zdGF0ZSA9IHt9O1xuXHRcdCRzY29wZS5zdGF0ZS5zaG93Qm94aW5nID0gZmFsc2U7XG5cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdChcImJveGluZzpnZXRcIik7XG4gICAgICAgIH0sIDIwMDApO1xuXG4gICAgICAgIHNvY2tldC5vbihcImJveGluZ1wiLCBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLnN0YXRlID0gc3RhdGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ3N0YXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBnZW5lcmFsU3luYy5zZXROb0xpdmUoJHNjb3BlLnN0YXRlLnNob3dCb3hpbmcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oXCJib3hpbmc6cmVzZXRUaW1lclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0aW1lci1yZXNldCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQub24oXCJib3hpbmc6c3RhcnRUaW1lclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCd0aW1lci1zdGFydCcpO1xuICAgICAgICB9KTtcbiAgICB9XG4pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ3J1Z2J5Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgZ2VuZXJhbFN5bmMsICRpbnRlcnZhbCwgJHRpbWVvdXQsIHNvY2tldCkge1xuXHQvLyAkc2NvcGUuc3RhdGUuc2hvd1J1Z2J5ID0gdHJ1ZTtcblx0JHNjb3BlLk1hdGggPSB3aW5kb3cuTWF0aDtcblx0JHNjb3BlLmxpbWl0ZXIgPSAwO1xuXG5cdE51bWJlci5wcm90b3R5cGUucGFkID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIHMgPSBTdHJpbmcodGhpcyk7XG4gICAgICB3aGlsZSAocy5sZW5ndGggPCAoc2l6ZSB8fCAyKSkge3MgPSBcIjBcIiArIHM7fVxuICAgICAgcmV0dXJuIHM7XG5cdH07XG5cdC8vICRzY29wZS4kYnJvYWRjYXN0KCd0aW1lci1zdGFydCcpO1xuXHQvLyAkdGltZW91dChmdW5jdGlvbigpIHtcblx0Ly8gXHQkc2NvcGUuJGJyb2FkY2FzdCgndGltZXItcmVzZXQnKTtcblx0Ly8gfSwgMTAwKTtcblx0JHRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0c29ja2V0LmVtaXQoXCJydWdieTpnZXRcIik7XG5cdH0sIDIwMDApO1xuXG5cdHNvY2tldC5vbihcInJ1Z2J5XCIsIGZ1bmN0aW9uKHN0YXRlKSB7XG5cdFx0JHNjb3BlLnN0YXRlID0gc3RhdGU7XG5cdFx0Ly8gY29uc29sZS5sb2coc3RhdGUudGltZSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbihcInJ1Z2J5OnRpbWVyXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdC8vICRzY29wZS4kYnJvYWRjYXN0KCdzdy0nICsgbXNnKTtcblx0XHRzd2l0Y2gobXNnKSB7XG5cdFx0XHRjYXNlIFwic3RhcnRcIjpcblx0XHRcdFx0JHNjb3BlLnN0YXJ0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInJlc3VtZVwiOlxuXHRcdFx0XHQkc2NvcGUuc3RhcnQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwicmVzZXRcIjpcblx0XHRcdFx0JHNjb3BlLnJlc2V0KCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInN0b3BcIjpcblx0XHRcdFx0JHNjb3BlLnN0b3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH0pO1xuXG5cdHNvY2tldC5vbihcInJ1Z2J5OnNldFRpbWVyXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdCRzY29wZS5zdG9wKCk7XG5cdFx0JHNjb3BlLnN0b3B3YXRjaCA9IG1zZztcblx0fSk7XG5cblx0c29ja2V0Lm9uKFwicnVnYnk6c2V0TGltaXRlclwiLCBmdW5jdGlvbihtc2cpIHtcblx0XHQkc2NvcGUubGltaXRlciA9IG1zZztcblx0fSk7XG5cblx0JHNjb3BlLnN0b3B3YXRjaCA9IDA7XG5cdHZhciB0aW1lclByb21pc2U7XG5cblx0JHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRpbWVyUHJvbWlzZSkgcmV0dXJuO1xuXHRcdHRpbWVyUHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdGlmICgoJHNjb3BlLmxpbWl0ZXIgPiAwICYmICRzY29wZS5zdG9wd2F0Y2ggPT0gJHNjb3BlLmxpbWl0ZXIgJiYgJHNjb3BlLnN0YXRlLmhhcmRMaW1pdGVyKSB8fCAoJHNjb3BlLnN0YXRlLmlzQ291bnRkb3duICYmICRzY29wZS5zdG9wd2F0Y2ggPCAxKSkgJHNjb3BlLnN0b3AoKTtcblx0XHRcdGVsc2UgJHNjb3BlLnN0b3B3YXRjaCs9JHNjb3BlLnN0YXRlLmlzQ291bnRkb3duPy0xOjE7XG5cdFx0fSwgMTAwMCk7XG5cdH07XG5cblx0JHNjb3BlLnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRpbWVyUHJvbWlzZSkgcmV0dXJuO1xuXHRcdCRpbnRlcnZhbC5jYW5jZWwodGltZXJQcm9taXNlKTtcblx0XHR0aW1lclByb21pc2UgPSB1bmRlZmluZWQ7XG5cdH07XG5cblx0JHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG5cdFx0JHNjb3BlLnN0b3AoKTtcblx0XHQkc2NvcGUuc3RvcHdhdGNoID0gMDtcblx0fTtcblxuXHQkc2NvcGUuJHdhdGNoKCdzdGF0ZScsIGZ1bmN0aW9uKCkge1xuXHRcdGdlbmVyYWxTeW5jLnNldE5vTGl2ZSgkc2NvcGUuc3RhdGUuc2hvd1J1Z2J5KTtcblx0fSk7XG59KTtcbiIsImFwcC5jb250cm9sbGVyKCd2YXJzaXR5TGl2ZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRpbnRlcnZhbCwgJHRpbWVvdXQsIHNvY2tldCkge1xuXHQkc2NvcGUuZGF0YVN0b3JlcyA9IHtcblx0XHR2bzoge30sXG5cdFx0aWdjOiB7fVxuXHR9O1xuXHQkc2NvcGUuc2hvdyA9IHt9O1xuXHRzb2NrZXQub24oXCJ2YXJzaXR5TGl2ZVwiLCBmdW5jdGlvbihtc2cpIHtcblx0XHQkc2NvcGUuc3RhdGUgPSBtc2c7XG5cdH0pO1xuXHRzb2NrZXQub24oXCJ2YXJzaXR5TGl2ZTp2b1wiLCBmdW5jdGlvbihtc2cpIHtcblx0XHRpZiAobXNnID09IDIpIHtcblx0XHRcdCRzY29wZS5zaG93LnZvID0gZmFsc2U7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdCRzY29wZS5kYXRhU3RvcmVzLnZvID0gbXNnO1xuXHRcdC8vICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XG5cdFx0JHNjb3BlLnNob3cudm8gPSB0cnVlO1xuXHR9KTtcblx0c29ja2V0Lm9uKFwidmFyc2l0eUxpdmU6aWdjXCIsIGZ1bmN0aW9uKG1zZykge1xuXHRcdGlmIChtc2cgPT0gMikge1xuXHRcdFx0JHNjb3BlLnNob3cuaWdjID0gZmFsc2U7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmICgkc2NvcGUuc2hvdy5pZ2MpICRzY29wZS5zaG93LmlnYyA9IGZhbHNlO1xuXHRcdCRzY29wZS5kYXRhU3RvcmVzLmlnYyA9IG1zZztcblx0XHQkc2NvcGUuc2hvdy5pZ2MgPSB0cnVlO1xuXHR9KTtcblx0c29ja2V0Lm9uKFwidmFyc2l0eUxpdmU6bHRcIiwgZnVuY3Rpb24obXNnKSB7XG5cdFx0aWYgKG1zZyA9PSAyKSB7XG5cdFx0XHQkc2NvcGUuc2hvdy5sdCA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoJHNjb3BlLnNob3cubHQpICRzY29wZS5zaG93Lmx0ID0gZmFsc2U7XG5cdFx0JHNjb3BlLmRhdGFTdG9yZXMubHQgPSBtc2c7XG5cdFx0JHNjb3BlLnNob3cubHQgPSB0cnVlO1xuXHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnNob3cubHQgPSBmYWxzZTtcblx0XHR9LCAxMDAwMCk7XG5cdH0pO1xuXHR2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIHNvY2tldC5lbWl0KCd2YXJzaXR5TGl2ZTpnZXQnKTtcblx0fTtcblx0dGljaygpO1xuXHQkaW50ZXJ2YWwodGljaywgMTAwMCk7XG59KTtcbiJdfQ==
