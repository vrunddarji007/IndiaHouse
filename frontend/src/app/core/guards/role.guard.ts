import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data?.['allowedRoles'] || [];

  const user = authService.currentUserValue;
  if (!user) { router.navigate(['/auth/register']); return false; }
  if (allowedRoles.length && !allowedRoles.includes(user.role || '')) {
    router.navigate(['/']); return false;
  }
  return true;
};
