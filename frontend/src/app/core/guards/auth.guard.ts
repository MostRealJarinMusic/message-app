import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from 'src/app/features/user/services/user/user.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  let user = userService.currentUser();

  if (!user) {
    try {
      user = await userService.loadCurrentUser();
    } catch {
      user = null;
    }
  }

  if (user) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url },
  });
};
