import { inject, Injectable } from '@angular/core';
import { PublicApiService } from '../api/public-api.service';
import { AuthService } from '../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { AuthTokenService } from '../auth-token/auth-token.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private apiService = inject(PublicApiService);
  private tokenService = inject(AuthTokenService);

  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {}

  start(token: string) {
    this.scheduleRefresh(token);
  }

  stop() {
    this.clearRefresh();
  }

  private scheduleRefresh(token: string) {
    const { exp } = jwtDecode<{ exp: number }>(token);

    console.log(exp);

    const expiry = exp * 1000 - Date.now();
    const refreshIn = Math.max(expiry - 30_000, 5_000); // 30s before token expiry, minimum of 5s

    this.clearRefresh();
    this.refreshTimer = setTimeout(() => this.refresh(), refreshIn);
  }

  private clearRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async refresh() {
    try {
      console.log('REFRESHING !!!');
      const { token } = await firstValueFrom(this.apiService.refresh());
      this.tokenService.setToken(token);
      this.scheduleRefresh(token);
    } catch {
      this.refreshTimer = setTimeout(() => this.refresh(), 30_000); // May delegate to interceptor
    }
  }
}
