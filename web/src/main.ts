import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import I18NextVue, { i18n } from './i18n'
import { setupPeriodicSync } from './services/offline'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(I18NextVue, { i18next: i18n })
app.mount('#app')

setupPeriodicSync()
