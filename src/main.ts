import { createApp, type Plugin } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'
import * as wanki from './plugins/wankidb'

import longPress from '@/plugins/directives/longPress'
import ripple from '@/plugins/directives/ripple'
import autofocus from '@/plugins/directives/autofocus'

import '@/plugins/collection'
import '@/plugins/fsrs'
import keepScroll from '@/plugins/directives/keepScroll'

// Create the Vue app
const app = createApp(App)
app.use(router)
app.use(store as Plugin)

// Register directives
app.directive('keep-scroll', keepScroll)
app.directive('long-press', longPress)
app.directive('autofocus', autofocus)
app.directive('ripple', ripple)

// Set up global properties
app.config.globalProperties.$wanki = wanki.default
window.wanki = wanki.default

// Mount the app
app.mount('#app')

// Register service worker
if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/service-worker.js')
  }
}
