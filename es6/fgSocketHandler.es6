import FGGlobal from './fgGlobal';

export default socket => {
    if (FGGlobal.debug) console.log(`* CONN ${socket.handshake.address}`);

    for (let com in FGGlobal.config.sockets) {
        let subs = FGGlobal.config.sockets[com];
        socket.on(com, msg => {
            if (FGGlobal.debug) console.log(`* SYNC ${com}:get ${msg}`);
            FGGlobal.dataStores[com] = msg;
            FGGlobal.io.sockets.emit(com, msg);
        })
        socket.on(`${com}:get`, msg => {
            if (FGGlobal.debug) console.log(`* GET  ${com}:get ${msg}`);
            FGGlobal.io.sockets.emit(com, FGGlobal.dataStores[com]);
        });
        for (let sub of subs) {
            let subId = `${com}:${sub}`;
            socket.on(subId, msg => {
                if (FGGlobal.debug) console.log(`* MSG  ${subId} ${msg}`);
                FGGlobal.io.sockets.emit(subId, msg);
            });
        }
    }

    for (let expose of FGGlobal.config.expose) {
        socket.on(`${expose}:get`, () => {
            if (FGGlobal.debug) console.log(`* XGET ${expose}:get`);
            FGGlobal.io.sockets.emit(expose, FGGlobal.config[expose]);
        });
    }

    if (FGGlobal.debug) socket.on('disconnect', () => console.log(`* DISC ${socket.handshake.address}`))
};
