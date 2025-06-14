import { createApp, type Plugin } from 'vue'
import i18n from './plugins/i18n'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'
import * as wanki from './plugins/wankidb'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

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
app.use(i18n)

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

// Listen for the beforeinstallprompt event to automatically trigger the browser's installation dialog
// .prompt() must be called with a user gesture. Better use a component
// window.addEventListener('beforeinstallprompt', (event: Event) => {
//   event.preventDefault()
//
//   if ('prompt' in event) {
//     void (event as { prompt: () => Promise<void> }).prompt()
//   }
// })
