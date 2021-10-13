require('../css/style.scss');

import Vue from 'vue'
import App from '../templates/popup.vue'

new Vue({
  el: '#app',
  render: h => h(App)
});