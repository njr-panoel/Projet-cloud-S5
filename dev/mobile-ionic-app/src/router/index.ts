import { RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import TabsLayout from '../views/TabsLayout.vue';
import MapView from '../views/MapView.vue';
import StatsView from '../views/StatsView.vue';
import MesSignauxView from '../views/MesSignauxView.vue';
import ProfileView from '../views/ProfileView.vue';

const routes: RouteRecordRaw[] = [
  // Temporarily default to login to test rendering
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  {
    path: '/tabs',
    component: TabsLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'map', name: 'Map', component: MapView },
      { path: 'stats', name: 'Stats', component: StatsView },
      { path: 'mes', name: 'MesSignaux', component: MesSignauxView },
      { path: 'profile', name: 'Profile', component: ProfileView }
    ]
  }
];

export default routes;