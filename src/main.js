import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'
import * as wanki from './plugins/wankidb'

import longPress from '@/plugins/directives/longPress.js'
import ripple from '@/plugins/directives/ripple.js'
import autofocus from '@/plugins/directives/autofocus.js'

import '@/plugins/collection.js'
import '@/plugins/scheduler.js'
import keepScroll from '@/plugins/directives/keepScroll.js'

const app = createApp(App)
app.config.devtools = true
app.use(router)
app.use(store)
app.directive('keep-scroll', keepScroll)
app.directive('long-press', longPress)
app.directive('autofocus', autofocus)
app.directive('ripple', ripple)

app.config.globalProperties.$wanki = wanki.default
window.wanki = wanki.default

app.mount('#app')

if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
  }
}
