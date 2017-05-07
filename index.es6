console.log(`In the event of issues, first try quitting and running 'npm install' and 'bower install'`);

// Package imports
import Minimist from 'minimist';
import Express from 'express';
import HTTP from 'http';
import SocketIO from 'socket.io';
import Path from 'path';
import Winston from 'winston-color';

import Stylus from 'stylus';
import PostCSSMiddleware from 'postcss-middleware';
import Cssnext from 'postcss-cssnext';
import Cssnano from 'cssnano';

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

let postCssPluginsDbg = [
    Cssnext({
        browsers: Config.browserSupport
    })
];

let postCssPluginsProd = [
    Cssnano({
        autoprefixer: false
    })
];

let postCssPlugins = [];
if (argv.debug) postCssPlugins = postCssPluginsDbg;
else postCssPlugins = postCssPlugins.concat(postCssPluginsProd)

app.use(Stylus.middleware({
    src: Path.join(__dirname, 'styl'),
    dest: Path.join(__dirname, 'public', 'css'),
    compile: (str, path) => Stylus(str)
        .set('filename', path)
        .set('include css', true)
        .set('paths', [
            'node_modules/'
        ])
}))
app.use('/css', PostCSSMiddleware({
    src: req => Path.join(__dirname, 'public', 'css', req.url),
    plugins: postCssPlugins
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
Winston.info(`Go to [hostname]:${port}/dashboard in a web browser to control`);
Winston.info(`The [hostname] is probably 'localhost' if OBS/the dashboard are running on this computer`);
