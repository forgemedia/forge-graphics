import FGGlobal from './fgGlobal';
import Winston from 'winston-color';

export default socket => {
    Winston.verbose('CONN', socket.handshake.address);

    for (let com in FGGlobal.config.sockets) {
        let subs = FGGlobal.config.sockets[com];
        socket.on(com, msg => {
            Winston.debug('SYNC', { com, msg });
            FGGlobal.dataStores[com] = msg;
            FGGlobal.io.sockets.emit(com, msg);
        })
        socket.on(`${com}:get`, msg => {
            Winston.debug('GET', { com, msg });
            FGGlobal.io.sockets.emit(com, FGGlobal.dataStores[com]);
        });
        for (let sub of subs) {
            let subId = `${com}:${sub}`;
            socket.on(subId, msg => {
                Winston.debug('MSG', { subId, msg });
                FGGlobal.io.sockets.emit(subId, msg);
            });
        }
    }

    for (let expose of FGGlobal.config.expose) {
        socket.on(`${expose}:get`, () => {
            Winston.debug('XGET', expose);
            FGGlobal.io.sockets.emit(expose, FGGlobal.config[expose]);
        });
    }

    socket.on('disconnect', () => Winston.verbose('DISC', socket.handshake.address));
};
