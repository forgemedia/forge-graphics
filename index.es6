console.log(`  Quit using CTRL+C`);
console.log(`  In the event of issues, first try quitting and running 'npm install' and 'bower install'`);
console.log(`  Time of start: ${new Date().toISOString()}`);

// Package imports
import Minimist from 'minimist';
import Express from 'express';
import HTTP from 'http';
import SocketIO from 'socket.io';

// Forge graphics module imports
import Config from './config.json';
import FGSocketHandler from './es6/fgSocketHandler';
import FGGlobal from './es6/fgGlobal';

// Set up server configuration
let argv = Minimist(process.argv.slice(2));
FGGlobal.debug = argv.debug;
FGGlobal.config = Config;
FGGlobal.dataStores = Config.dataStoresDefault;

// Set up app configuration
let app = Express();
let server = HTTP.createServer(app);
FGGlobal.io = SocketIO.listen(server);

app.use(Express.static(__dirname + '/public'));
app.use('/bower_components', Express.static(__dirname + '/bower_components'));
app.use('/node_modules', Express.static(__dirname + '/node_modules'));

// Handle socket connections
FGGlobal.io.on('connection', FGSocketHandler);

let port = Config.port;
if (argv.port) port = argv.port;
server.listen(port);

console.log(`\n  Forge Graphics Server - ${Config.project}`);
console.log(`  Listening on port ${port}`);
if (FGGlobal.debug) console.log(`* Debug on`)
console.log(`\n  Add http://[hostname]:${port} to a BrowserSource in OBS to use`);
console.log(`  Go to [hostname]:'${port}'/dashboard in a web browser to control`);
console.log(`  The [hostname] is probably 'localhost' if OBS/the dashboard are running on this computer`);
