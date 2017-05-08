import SocketIOClient from 'socket.io-client';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Global from './dash/_global';
import BugApp from './dash/_bug';

Vue.use(VueRouter);

let Bug = { template: '<div id="bugPanel"></div>' };
let Routes = [
    { path: '/bug', component: Bug, name: 'Bug' },
    { path: '*', redirect: '/bug' }
];
let Router = new VueRouter({
    routes: Routes
});
let AppApp = new Vue({
    data: {
        mounted: false
    },
    router: Router,
    mounted: function() {
        this.mounted = true
    }
}).$mount('#dashboard');

BugApp.$mount('#bugPanel');

Global.SIO = SocketIOClient.connect();
