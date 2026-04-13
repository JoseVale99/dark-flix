import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '@services/profile';

export const profileGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router         = inject(Router);

  if (profileService.isProfileSelected()) {
    return true;
  }

  return router.createUrlTree(['/profiles']);
};
