import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/public-dashboard.page').then((m) => m.PublicDashboardPage)
      },
      {
        path: 'carte',
        loadComponent: () => import('./pages/public-map.page').then((m) => m.PublicMapPage)
      }
    ]
  }
];
