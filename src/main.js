// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'bootstrap-vue/dist/bootstrap-vue.css';
import { BootstrapVue, IconsPlugin, TablePlugin } from 'bootstrap-vue';
Vue.config.productionTip = false

/* eslint-disable no-new */

export const eventBus = new Vue();

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(TablePlugin)
