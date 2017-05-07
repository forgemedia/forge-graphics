console.log(`In the event of issues, first try quitting and running 'npm install' and 'bower install'`);

// Package imports
import Minimist from 'minimist';
import Express from 'express';
import HTTP from 'http';
import SocketIO from 'socket.io';
import Path from 'path';
import Winston from 'winston-color';
import NodeSassMiddleware from 'node-sass-middleware';
import PostCSSMiddleware from 'postcss-middleware';
import Cssnext from 'postcss-cssnext';

// Forge graphics module imports
import Config from './config.json';
import FGSocketHandler from './es6/fgSocketHandler';
import FGGlobal from './es6/fgGlobal';
import FGDashboardRouting from './es6/fgDashboardRouting';

// Set up server configuration
let argv = Minimist(process.argv.slice(2));
Winston.level = argv.debug? 'debug' : 'info';
FGGlobal.config = Config;
FGGlobal.dataStores = Config.dataStoresDefault;

// Set up app configuration
let app = Express();
let server = HTTP.createServer(app);
FGGlobal.io = SocketIO.listen(server);

app.set('view engine', 'pug');
app.set('views', Path.join(__dirname, 'views'));
app.locals = {
    basedir: Path.join(app.get('views'), 'dash', 'templates'),
    project: Config.project
};

app.use(NodeSassMiddleware({
    src: Path.join(__dirname, 'scss'),
    dest: Path.join(__dirname, 'public', 'stylesheets', 'scss-out'),
    prefix: '/stylesheets/scss-out',
    response: false,
    includePaths: [
        'node_modules/bootstrap/scss/'
    ]
}));
app.use('/stylesheets/scss-out', PostCSSMiddleware({
    src: req => Path.join(__dirname, 'public', 'stylesheets', 'scss-out', req.url),
    plugins: [
        Cssnext({
            browsers: ['Chrome > 40']
        })
    ]
}));

app.get('/', (req, res) => res.render('cg/index'));
app.use(['/dash', '/dashboard'], FGDashboardRouting);

app.use(Express.static(Path.join(__dirname, 'public')));
for (let path of Config.publicPaths) app.use(`/${path}`, Express.static(Path.join(__dirname, path)));

app.use((req, res) => res.status(404).render('404'));

// Handle socket connections
FGGlobal.io.on('connection', FGSocketHandler);

let port = argv.port? argv.port : Config.port;
server.listen(port);

Winston.info(`Forge Graphics Server - ${Config.project}`);
Winston.info(`Quit using CTRL+C`);
Winston.info(`Time of start: ${new Date().toISOString()}`);
Winston.info(`Listening on port ${port}`);
Winston.info(`Add http://[hostname]:${port} to a BrowserSource in OBS to use`);
Winston.info(`Go to [hostname]:'${port}'/dashboard in a web browser to control`);
Winston.info(`The [hostname] is probably 'localhost' if OBS/the dashboard are running on this computer`);
