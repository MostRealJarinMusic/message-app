import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  //const userService = inject(UserService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return true;

  return router.navigate(['/dashboard']);
};

// export const guestGuard: CanActivateFn = (route, state) => {
//   const userService = inject(UserService);
//   const router = inject(Router);
//   const apiService = inject(PrivateApiService);

//   const currentUser = userService.currentUser();

//   if (currentUser) {
//     // User already logged in → redirect
//     return router.createUrlTree(['/dashboard'], { queryParams: { redirectTo: state.url } });
//   }

//   // User not loaded → fetch from API
//   return apiService.getCurrentUser().pipe(
//     map((user) => {
//       userService.currentUser.set(user); // cache user
//       // If user exists, redirect to dashboard
//       return user
//         ? router.createUrlTree(['/dashboard'], { queryParams: { redirectTo: state.url } })
//         : true; // No user → allow access
//     }),
//     catchError(() => of(true)), // If API fails → allow guest access
//   );
// };

// export const guestGuard: CanActivateFn = async (route, state) => {
//   const userService = inject(UserService);
//   const apiService = inject(PrivateApiService);
//   const router = inject(Router);

//   let user = userService.currentUser();

//   if (!user) {
//     try {
//       // Wait for API if user is not loaded
//       user = await firstValueFrom(apiService.getCurrentUser());
//       userService.currentUser.set(user);
//     } catch {
//       // API failed → allow guest
//       return true;
//     }
//   }

//   // If user exists → redirect to dashboard
//   return user
//     ? router.createUrlTree(['/dashboard'], { queryParams: { redirectTo: state.url } })
//     : true; // No user → allow guest
// };
