var express 	= require('express'),
	http 		= require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var bug = {};

io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	socket.on("bug", function(msg) {
        bug = msg;
		io.sockets.emit("bug", msg);
	});

    socket.on("bug:get", function(msg) {
		io.sockets.emit("bug", bug);
	});
});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

server.listen(3000);
console.log("Go to localhost:3000/dashboard to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG")
