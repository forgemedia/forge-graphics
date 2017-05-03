console.log('  Quit using CTRL+C');
console.log('  In the event of issues, first try quitting and running \'npm install\' and \'bower install\'');
console.log('  Time of start: ' + new Date().toISOString());

import Minimist from 'minimist';
import Express from 'express';
import HTTP from 'http';
import SocketIO from 'socket.io';
import Config from './config.json';

let argv = Minimist(process.argv.slice(2));
let debug = argv.debug;

let dataStores = Config.dataStoresDefault;

let app = Express();
let server = HTTP.createServer(app);
let io = SocketIO.listen(server);

let port = Config.port;
if (argv.port) port = argv.port;

io.on('connection', socket => {
    if (debug) console.log('* Client connected');

    for (let com in Config.sockets) {
        let subs = Config.sockets[com];
        socket.on(com, msg => {
            if (debug) console.log(`* SYNC ${com}:get ${msg}`);
            dataStores[com] = msg;
            io.sockets.emit(com, msg);
        })
        socket.on(`${com}:get`, msg => {
            if (debug) console.log(`* GET  ${com}:get ${msg}`);
            io.sockets.emit(com, dataStores[com]);
        });
        for (let sub of subs) {
            let subId = `${com}:${sub}`;
            socket.on(subId, msg => {
                if (debug) console.log(`* MSG  ${subId} ${msg}`);
                io.sockets.emit(subId, msg);
            });
        }
    }

    for (let expose of Config.expose) {
        socket.on(`${expose}:get`, () => {
            if (debug) console.log(`* XGET ${expose}:get`);
            io.sockets.emit(expose, Config[expose]);
        });
    }
});

app.use(Express.static(__dirname + '/public'));
app.use('/bower_components', Express.static(__dirname + '/bower_components'));
app.use('/node_modules', Express.static(__dirname + '/node_modules'));

server.listen(port);

console.log('\n  Forge Graphics Server - ' + Config.project);
console.log('  Listening on port ' + port);
if (debug) console.log('* Debug on')
console.log('\n  Add http://[hostname]:' + port + ' to a BrowserSource in OBS to use');
console.log('  Go to [hostname]:' + port + '/dashboard in a web browser to control');
console.log('  The [hostname] is probably \'localhost\' if OBS/the dashboard are running on this computer');
