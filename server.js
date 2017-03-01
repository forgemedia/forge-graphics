var express 	= require('express'),
	http 		= require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var debug = false;

var general = {};
var lowerThirds = {};

io.on('connection', function(socket) {
	if (debug) console.log('  Client connected');

	socket.on('general', function(msg) {
		if (debug) console.log('* general', msg);
        general = msg;
		io.sockets.emit('general', msg);
	});

    socket.on('general:get', function(msg) {
		io.sockets.emit('general', general);
	});

	socket.on('general:resetcg', function() {
		io.sockets.emit('general:resetcg');
	});

	socket.on('lowerThirds', function(msg) {
		if (debug) console.log('* lowerThirds', msg);
        lowerThirds = msg;
		io.sockets.emit('lowerThirds', msg);
	});

	socket.on('lowerThirds:showTitle', function(msg) {
		io.sockets.emit("lowerThirds:showTitle", msg);
	});

	socket.on('lowerThirds:showHeadline', function(msg) {
		io.sockets.emit("lowerThirds:showHeadline", msg);
	});

	socket.on('lowerThirds:updateHeadline', function(msg) {
		io.sockets.emit("lowerThirds:updateHeadline", msg);
	});

	socket.on('lowerThirds:hideHeadline', function() {
		io.sockets.emit("lowerThirds:hideHeadline");
	});

	socket.on('lowerThirds:showOngoing', function(msg) {
		io.sockets.emit("lowerThirds:showOngoing", msg);
	});

	socket.on('lowerThirds:hideOngoing', function() {
		io.sockets.emit("lowerThirds:hideOngoing");
	});
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

server.listen(3000);

console.log('Forge Graphics Server')
if (debug) console.log('* Debug on')
console.log('  Go to [hostname]:3000/dashboard to control')
console.log('  run \'play 1-1 [html] http://[hostname]:3000\' in CasparCG\n')
