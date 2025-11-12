import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import ja from 'element-plus/es/locale/lang/ja';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// ✅ ResizeObserverループ警告を無視する設定（完全版）
const resizeObserverErr = /ResizeObserver loop completed with undelivered notifications./;

window.addEventListener('error', (event) => {
  if (resizeObserverErr.test(event.message)) {
    event.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (resizeObserverErr.test(event.reason?.message)) {
    event.preventDefault();
  }
});

// ✅ Vueアプリ本体設定
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(ElementPlus, { locale: ja });
app.use(router);

app.mount('#app');
