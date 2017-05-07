import SIO from 'socket.io-client';
import BugApp from './dash/_bug';

BugApp.$mount('#bugPanel');

SIO.connect();
