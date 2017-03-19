console.log('  Quit using CTRL+C');
console.log('  In the event of issues, first try quitting and running \'npm install\' and \'bower install\'');
console.log('  Time of start: ' + new Date().toISOString());

var argv = require('minimist')(process.argv.slice(2));

var express	= require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var fs = require('fs');

var debug = argv.debug;

var config = JSON.parse(fs.readFileSync('config.json'));
var dataStores = config.dataStoresDefault;

var port = config.port;
if (argv.port) port = argv.port;

io.on('connection', function(socket) {
	if (debug) console.log('* Client connected');

	Object.keys(config.sockets).forEach(function(d) {
		subs = config.sockets[d];
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
		io.sockets.emit('project', config.project);
	});

	socket.on('teams:get', function() {
		console.log('* GET  teams:get');
		io.sockets.emit('teams', config.teams);
	});
});

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

server.listen(port);

console.log('\n  Forge Graphics Server - ' + config.project);
console.log('  Listening on port ' + port);
if (debug) console.log('* Debug on')
console.log('\n  Add http://[hostname]:' + port + ' to a BrowserSource in OBS to use');
console.log('  Go to [hostname]:' + port + '/dashboard in a web browser to control');
console.log('  The [hostname] is probably \'localhost\' if OBS/the dashboard are running on this computer');
