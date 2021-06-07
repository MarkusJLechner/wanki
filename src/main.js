import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'

import List from '@/components/List.vue'
import { longPress } from '@/plugins/directives.js'

const app = createApp(App)
app.config.devtools = true
app.use(router)
app.use(store)
app.directive('long-press', longPress)

app.mount('#app')

if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
  }
}
