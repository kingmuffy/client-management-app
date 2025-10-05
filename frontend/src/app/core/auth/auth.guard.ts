import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(MatSnackBar);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirect: state.url },
    });
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (allowedRoles?.length) {
    const role = auth.role ?? '';
    if (!allowedRoles.includes(role)) {
      snack.open('You are not authorized to view this page.', 'Close', {
        duration: 3000,
      });
      return router.createUrlTree(['/clients']);
    }
  }

  return true;
};
