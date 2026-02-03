import { createRouter } from '@ionic/vue-router';
import { createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import Login from '../pages/Login.vue';
import Map from '../pages/Map.vue';
import Stats from '../pages/Stats.vue';
import MesSignaux from '../pages/MesSignaux.vue';
import Profil from '../pages/Profil.vue';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: Login },
  {
    path: '/',
    component: () => import('../pages/Tabs.vue'),
    children: [
      { path: '', redirect: '/map' },
      { path: 'map', name: 'map', component: Map },
      { path: 'stats', name: 'stats', component: Stats },
      { path: 'mes-signaux', name: 'mes-signaux', component: MesSignaux },
      { path: 'profil', name: 'profil', component: Profil }
    ],
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  if (auth.initialized === false) {
    await auth.init();
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && auth.isAuthenticated) {
    next({ name: 'map' });
  } else {
    next();
  }
});

export default router;
