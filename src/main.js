import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { request } from 'util/request.js'

Vue.config.productionTip = false

Vue.prototype.$axios = request


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
