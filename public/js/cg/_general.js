app.controller('generalCtrl',
    function($scope, generalSync, $timeout, $filter, $interval, socket) {
        $scope.tickInterval = 1000;

        $scope.state = {};

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

        var clockText = $filter('date')(Date.now(), "HH:mm");

        // $scope.showVotesGraph = false;
        // $scope.showFinalGraph = false;
        // $scope.curWinner = "";
        // $scope.curPos = "";
        // $scope.round = "";

        $scope.htNumber = 0;
        // $scope.hashtags = [{
        //         hashtag: '@ForgeSport',
        //         classes: []
        //     },
        //     {
        //         hashtag: '#suvarsity',
        //         classes: ['uos']
        //     },
        //     {
        //         hashtag: '#hallamvarsity',
        //         classes: ['shu']
        //     }
        // ];
		// $scope.iSocialMediaOutlets = [
		// 	{
		// 		icon: 'facebook-square',
		// 		id: '@ForgeSportPage'
		// 	},
		// 	{
		// 		icon: 'twitter-square',
		// 		id: '@ForgeSport'
		// 	},
		// 	{
		// 		icon: 'instagram',
		// 		id: '@Forge_Sport'
		// 	}
		// ];

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
