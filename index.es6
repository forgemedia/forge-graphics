console.log(`  Quit using CTRL+C`);
console.log(`  In the event of issues, first try quitting and running 'npm install' and 'bower install'`);
console.log(`  Time of start: ${new Date().toISOString()}`);

// Package imports
import Minimist from 'minimist';
import Express from 'express';
import HTTP from 'http';
import SocketIO from 'socket.io';
import Path from 'path';

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

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');
app.locals = {
    basedir: Path.join(app.get('views'), 'dash', 'templates'),
    project: Config.project
}

app.get('/404', (req, res) => res.send('404!'));

app.get('/', (req, res) => res.render('cg/index'));

app.get(/^\/dashboard\/templates\/(.+)\.html/,
    (req, res) => res.render(`dash/templates/${req.params[0]}`));

app.get(['/dash', '/dashboard'], (req, res) => res.render('dash/index'));

app.use(Express.static(Path.join(__dirname, 'public')));
for (let path of Config.publicPaths) app.use(`/${path}`, Express.static(Path.join(__dirname, path)));

// Handle socket connections
FGGlobal.io.on('connection', FGSocketHandler);

let port = argv.port? argv.port : Config.port;
server.listen(port);

if (!FGGlobal.debug) {
    console.log(`\n  Forge Graphics Server - ${Config.project}`);
    console.log(`  Listening on port ${port}`);
    console.log(`\n  Add http://[hostname]:${port} to a BrowserSource in OBS to use`);
    console.log(`  Go to [hostname]:'${port}'/dashboard in a web browser to control`);
    console.log(`  The [hostname] is probably 'localhost' if OBS/the dashboard are running on this computer`);
} else console.log(`\n* Debug on`);
