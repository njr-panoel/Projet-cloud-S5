import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./manager-layout.component').then((m) => m.ManagerLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/manager-dashboard.page').then((m) => m.ManagerDashboardPage)
      },
      {
        path: 'signalements',
        loadComponent: () =>
          import('./pages/manager-signalements.page').then((m) => m.ManagerSignalementsPage)
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./pages/manager-users.page').then((m) => m.ManagerUsersPage)
      }
    ]
  }
];
