import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/manager.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'manager',
    canMatch: [authGuard, managerGuard],
    loadChildren: () => import('./features/manager/manager.routes').then((m) => m.MANAGER_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
