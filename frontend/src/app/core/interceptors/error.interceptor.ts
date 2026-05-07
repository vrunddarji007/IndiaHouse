import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err) => {
      if ([401, 403].includes(err.status)) {
        // Auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        authService.logout();
      }

      const errorMessage = err.error?.message || err.error?.error || err.statusText || 'An unexpected error occurred';
      
      // Only show toast if it's not a "silent" error (optional logic)
      toastService.error(errorMessage);
      
      return throwError(() => err);
    })
  );
};
