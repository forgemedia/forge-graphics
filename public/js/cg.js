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
			setNoLive: function(nl) {
				noLive = nl;
			}
        };
    }
);
