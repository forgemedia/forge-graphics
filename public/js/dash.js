import SocketIOClient from 'socket.io-client';
import Global from './dash/_global';
import BugApp from './dash/_bug';

BugApp.$mount('#bugPanel');

Global.SIO = SocketIOClient.connect();
