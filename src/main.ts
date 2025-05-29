import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'
import * as wanki from './plugins/wankidb'

import longPress from '@/plugins/directives/longPress'
import ripple from '@/plugins/directives/ripple'
import autofocus from '@/plugins/directives/autofocus'

import '@/plugins/collection'
import '@/plugins/scheduler'
import keepScroll from '@/plugins/directives/keepScroll'

// Create the Vue app
const app = createApp(App)
app.config.devtools = true
app.use(router)
app.use(store)

// Register directives
app.directive('keep-scroll', keepScroll)
app.directive('long-press', longPress)
app.directive('autofocus', autofocus)
app.directive('ripple', ripple)

// Set up global properties
app.config.globalProperties.$wanki = wanki.default
// @ts-ignore - Adding wanki to window
window.wanki = wanki.default

// Mount the app
app.mount('#app')

// Register service worker
if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker')
  }
}
