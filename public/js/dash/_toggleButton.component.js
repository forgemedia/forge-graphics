import Vue from 'vue';

export default Vue.component('toggle-button', {
    props: ['value', 'title'],
    template: '<button class="toggle-button" v-on:click="toggle" v-bind:class="{ active: internalValue }">{{ title }}</button>',
    data: function() {
        return {
            internalValue: false
        }
    },
    watch: {
        'internalValue': function() {
            this.$emit('input', this.internalValue);
        }
    },
    methods: {
        created: function() {
            this.internalValue = this.value;
        },
        toggle: function() {
            this.internalValue = !this.internalValue;
        }
    }
})
