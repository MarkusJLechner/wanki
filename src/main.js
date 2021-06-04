import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import store from './store'
const app = createApp(App)
app.config.devtools = true
app.use(router)
app.use(store)
app.mount('#app')

if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
  }
}
