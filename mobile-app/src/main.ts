import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import './theme/variables.css';
import './styles/global.css';
import 'leaflet/dist/leaflet.css';

const app = createApp(App);

app.use(IonicVue);
app.use(createPinia());
app.use(router);

// Global runtime error handlers to help diagnose blank page issues
function showErrorBanner(message: string) {
  try {
    let el = document.getElementById('app-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-error';
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.right = '0';
      el.style.padding = '10px 12px';
      el.style.background = 'linear-gradient(90deg,#ef4444,#d53f3f)';
      el.style.color = 'white';
      el.style.zIndex = '99999';
      el.style.fontWeight = '700';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      document.body.appendChild(el);
    }
    el.textContent = message;
  } catch (e) { console.error('Failed to show error banner', e); }
}

window.addEventListener('error', (e) => {
  // Show minimal alert so user sees the issue immediately
  console.error('Global error', e.error || e.message);
  showErrorBanner('Erreur globale: ' + (e.error?.message ?? e.message));
  try { alert('Erreur globale: ' + (e.error?.message ?? e.message)); } catch (err) { /* ignore */ }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection', e.reason);
  showErrorBanner('Rejet non géré: ' + (e.reason?.message ?? e.reason));
  try { alert('Rejet non géré: ' + (e.reason?.message ?? e.reason)); } catch (err) { /* ignore */ }
});

app.config.errorHandler = (err) => {
  console.error('Vue error', err);
  showErrorBanner('Erreur Vue: ' + (err?.message ?? err));
  try { alert('Erreur Vue: ' + (err?.message ?? err)); } catch (e) { /* ignore */ }
};

router.isReady().then(() => {
  app.mount('#app');
});
