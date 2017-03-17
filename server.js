console.log('  Quit using CTRL+C');
console.log('  In the event of issues, first try quitting and running \'npm install\' and \'bower install\'');

var project = 'Varsity 2017';

var express	= require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var debug = true;

var sockets = {
	'general': [
		'resetcg'
	],
	'lowerThirds': [
		'showTitle',
		'showHeadline',
		'updateHeadline',
		'hideHeadline',
		'showOngoing',
		'hideOngoing'
	],
	'boxing': [
		'startTimer',
		'resetTimer'
	],
	'rugby': [
		'startTimer',
		'resetTimer',
		'stopTimer',
		'resumeTimer'
	]
};

var dataStores = {};
dataStores.rugby = {};
dataStores.rugby.leftScore = 0;
dataStores.rugby.rightScore = 0;

io.on('connection', function(socket) {
	if (debug) console.log('* Client connected');

	Object.keys(sockets).forEach(function(d) {
		subs = sockets[d];
		socket.on(d, function(msg) {
			if (debug) console.log('* SYNC ' + d, msg);
			dataStores[d] = msg;
			io.sockets.emit(d, msg);
		});
		socket.on(d + ':get', function(msg) {
			if (debug) console.log('* GET  ' + d + ':get', msg ? msg : '');
			io.sockets.emit(d, dataStores[d]);
		});
		subs.forEach(function(e) {
			var f = d + ':' + e;
			socket.on(f, function(msg) {
				if (debug) console.log('* MSG  ' + f, msg ? msg : '');
				io.sockets.emit(f, msg);
			});
		});
	});

	socket.on('project:get', function() {
		console.log('* GET  project:get');
		io.sockets.emit('project', project);
	});
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

server.listen(3000);

console.log('\n  Forge Graphics Server - ' + project);
if (debug) console.log('* Debug on')
console.log('\n  Add http://[hostname]:3000 to a BrowserSource in OBS to use');
console.log('  Go to [hostname]:3000/dashboard in a web browser to control');
console.log('  The [hostname] is probably \'localhost\' if OBS/the dashboard are running on this computer');
