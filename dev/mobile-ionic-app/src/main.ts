import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { IonicVue } from '@ionic/vue';
import App from './App.vue';
import routes from './router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Core CSS required for Ionic components to work properly
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// Optional CSS utils
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import './theme/variables.css';

// Debug logging to visible div
const debugLog = (msg: string) => {
  console.log(msg);
  const el = document.getElementById('debug');
  if (el) {
    el.innerHTML += `<div>${msg}</div>`;
  }
};

// Global error handler to log JS errors to console
window.addEventListener('error', (event) => {
  debugLog(`ERROR: ${event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
  debugLog(`UNHANDLED: ${event.reason}`);
});

debugLog('=== App Boot Start ===');

const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes
});

const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);

debugLog('App created');

// Mount immediately without waiting for auth
router.isReady().then(() => {
  debugLog('Router ready, mounting');
  try {
    app.mount('#app');
    debugLog('App mounted OK');
  } catch (e: any) {
    debugLog(`Mount error: ${e.message}`);
  }
}).catch(err => {
  debugLog(`Router error: ${err.message}`);
});

// Set up auth state listener with timeout
const auth = getAuth();
debugLog('Firebase Auth initialized');

const authTimeout = setTimeout(() => {
  debugLog('Auth listener timeout - assuming not logged in');
  router.push('/login').catch(e => debugLog(`Nav error: ${e.message}`));
}, 3000);

onAuthStateChanged(auth, (user) => {
  clearTimeout(authTimeout);
  if (user) {
    debugLog(`Logged in: ${user.email}`);
  } else {
    debugLog('Not logged in');
    router.push('/login').catch(e => debugLog(`Nav error: ${e.message}`));
  }
}, (error) => {
  clearTimeout(authTimeout);
  debugLog(`Auth error: ${error.message}`);
});