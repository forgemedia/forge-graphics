var express 	= require('express'),
	http 		= require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var debug = true;

var general = {};
var lowerThirds = {};
var boxing = {};

var dataStores = {};

io.on('connection', function(socket) {
	if (debug) console.log('  Client connected');

	var syncSockets = [
		'general',
		'lowerThirds',
		'boxing'
	];

	var msgSockets = [
		'general',
		'general:resetcg',
		'lowerThirds',
		'lowerThirds:showTitle',
		'lowerThirds:showHeadline',
		'lowerThirds:updateHeadline',
		'lowerThirds:hideHeadline',
		'lowerThirds:showOngoing',
		'lowerThirds:hideOngoing',
		'boxing',
		'boxing:startTimer',
		'boxing:resetTimer'
	];

	syncSockets.forEach(function(d) {
		socket.on(d, function(msg) {
			if (debug) console.log('* SYNC ' + d, msg);
			dataStores[d] = msg;
			io.sockets.emit(d, msg);
		});
		socket.on(d + ':get', function(msg) {
			if (debug) console.log('* GET  ' + d + ':get', msg ? msg : '');
			io.sockets.emit(d, dataStores[d]);
		});
	});

	msgSockets.forEach(function(d) {
		socket.on(d, function(msg) {
			if (debug) console.log('* MSG  ' + d, msg ? msg : '');
			io.sockets.emit(d, msg);
		});
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
