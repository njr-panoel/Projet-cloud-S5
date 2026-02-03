import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const mobileUserGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.getRole();
  if (role === 'UTILISATEUR_MOBILE' || role === 'MANAGER') {
    return true;
  }

  return router.parseUrl('/');
};
