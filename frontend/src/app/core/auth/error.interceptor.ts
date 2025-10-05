import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, race, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        snack.open('Please sign in to continue.', 'Close', { duration: 3000 });
        router.navigate(['/login'], { queryParams: { redirect: router.url } });
        return throwError(() => err);
      }

      if (err.status === 403) {
        snack.open('You are not authorized to perform this action.', 'Close', {
          duration: 3000,
        });
        router.navigate(['/clients']);
        return throwError(() => err);
      }

      if (err.status === 0 || (err.status >= 500 && err.status < 600)) {
        const ref = snack.open('Request failed. Try again?', 'Retry', {
          duration: 5000,
        });

        return race(
          ref.onAction().pipe(
            take(1),
            switchMap(() => next(req))
          ),
          ref.afterDismissed().pipe(
            take(1),
            map(() => {
              throw err;
            })
          )
        );
      }

      return throwError(() => err);
    })
  );
};
