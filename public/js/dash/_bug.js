import Vue from 'vue';
import Global from './_global';
import ToggleButton from './_toggleButton.component';

export default new Vue({
    data: {
        dataStore: {
            showBug: true
        }
    },
    created: function() {
        this.$watch('dataStore', function() {
            Global.SIO.emit('bug', this.dataStore);
        }, { deep: true });
    }
})
