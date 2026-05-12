import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

/**
 * Property details should not be visible to:
 * - guests (not logged in)
 * - logged-in users with incomplete registration
 */
export const propertyDetailGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  const user = auth.currentUserValue;

  if (!user) {
    toast.info('Please login/register first to view property details.');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (!user.isProfileComplete && user.role !== 'host') {
    toast.warning('Registration incomplete. Please complete registration first.');
    router.navigate(['/auth/register'], { queryParams: { incomplete: true, returnUrl: state.url } });
    return false;
  }

  return true;
};

