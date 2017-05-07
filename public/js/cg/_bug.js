import Vue from 'vue';
export default class extends Vue {
    constructor (id) {
        super({
            el: id,
            data: {
                message: 'This is the message'
            }
        });
    }
}
