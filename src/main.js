import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'
import uploader from 'vue-simple-uploader'
let vm = null
const sendThis = _this => {
  vm = _this
}

// mock
import './mock'

import bootstrap from './core/bootstrap'
import './core/use'
import './permission' // permission control
import './utils/filter' // global filter

Vue.config.productionTip = false

// mount axios Vue.$http and this.$http
Vue.use(VueAxios)
Vue.use(uploader)

if (process.platform === 'darwin') {
  require('electron').ipcRenderer.on('startServer', (ev, msg) => {
    console.log(msg)
    if (vm) {
      vm.$router.push('./simApplication')
      setTimeout(() => {
        console.log(vm)
        vm.handleAdd()
      }, 500)
    }
  })
}

export default {
  sendThis
}

new Vue({
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
