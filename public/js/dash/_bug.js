import Vue from 'vue';
import ToggleButton from './_toggleButton.component';

export default new Vue({
    data: {
        dataStore: {
            showBug: true
        },
        methods: {
            created: function() {
                this.$on('toggle', function(vb) {
                    alert(vb);
                })
            }
        }
    }
})
