import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { mobileUserGuard } from '../../core/guards/mobile-user.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/public-dashboard.page').then((m) => m.DashboardComponent)
      },
      {
        path: 'carte',
        loadComponent: () => import('./pages/public-map.page').then((m) => m.MapViewComponent)
      },
      {
        path: 'signalements',
        loadComponent: () => import('./pages/public-signalements.page').then((m) => m.PublicSignalementsPage)
      },
      {
        path: 'signaler',
        canMatch: [authGuard, mobileUserGuard],
        loadComponent: () => import('./pages/report-signalement.page').then((m) => m.ReportSignalementPage)
      }
    ]
  }
];
