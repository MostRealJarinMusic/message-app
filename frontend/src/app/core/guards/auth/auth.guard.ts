import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, filter, map, of, switchMap, take } from 'rxjs';
import { UserService } from 'src/app/features/user/services/user/user.service';
import { PrivateApiService } from '../../services/api/private-api.service';
import { AuthService } from '../../services/auth/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const userService = inject(UserService);
//   const router = inject(Router);
//   const apiService = inject(PrivateApiService);

//   const currentUser = userService.currentUser();
//   if (currentUser) return true;

//   // await userService.loadCurrentUser();
//   // let user = userService.currentUser();
//   // console.log('Attempt to get user:', user);

//   // if (user) return true;

//   // return router.createUrlTree(['/login'], {
//   //   queryParams: { redirectTo: state.url },
//   // });

//   // return userService.currentUser$.pipe(
//   //   take(1),
//   //   map((user) => {
//   //     console.log('Received user from user service pipe', user);

//   //     if (user) return true;

//   //     return router.createUrlTree(['login'], { queryParams: { redirectTo: state.url } });
//   //   }),
//   // );

//   return apiService.getCurrentUser().pipe(
//     switchMap((user) => {
//       if (user) return of(true);

//       return of(router.createUrlTree(['login'], { queryParams: { redirectTo: state.url } }));
//     }),
//     catchError(() =>
//       of(router.createUrlTree(['login'], { queryParams: { redirectTo: state.url } })),
//     ),
//   );
// };

// export const authGuard: CanActivateFn = async (route, state) => {
//   const router = inject(Router);
//   const userService = inject(UserService);

//   console.log('[AuthGuard] start');

//   const current = userService.currentUser();
//   console.log('[AuthGuard] current user:', current);

//   if (current) {
//     console.log('[AuthGuard] user exists, allow navigation');
//     return true;
//   }

//   try {
//     console.log('[AuthGuard] user not loaded, fetching...');
//     const user = await userService.loadCurrentUser();
//     console.log('[AuthGuard] fetched user:', user);

//     if (user) {
//       console.log('[AuthGuard] user exists after fetch, allow navigation');
//       return true;
//     }

//     console.log('[AuthGuard] user null after fetch, redirect');
//     return router.createUrlTree(['/login'], {
//       queryParams: { redirectTo: state.url },
//     });
//   } catch (err) {
//     console.log('[AuthGuard] error fetching user:', err);
//     return router.createUrlTree(['/login'], {
//       queryParams: { redirectTo: state.url },
//     });
//   }
// };

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) return true;

    return this.router.createUrlTree(['/login'], {
      queryParams: { redirectTo: state.url },
    });
  }
}
