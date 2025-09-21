import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';
import { loggerInterceptor } from './core/interceptors/logger/logger.interceptor';
import { AuthService } from './core/services/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loggerInterceptor])),
    provideAppInitializer(async () => {
      const authService = inject(AuthService);

      try {
        await authService.refresh();
      } catch {
        console.log("No refresh token - assuming user hasn't logged in before");
      }
    }),
  ],
};
