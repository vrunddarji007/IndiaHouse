import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if ([401, 403].includes(err.status)) {
        // Auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        authService.logout();
      }

      const error = err.error?.message || err.statusText;
      console.error(err);
      return throwError(() => new Error(error));
    })
  );
};
