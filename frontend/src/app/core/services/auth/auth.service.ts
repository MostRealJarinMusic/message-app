import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoginCredentials, RegisterPayload } from '@common/types';
import { SessionService } from '../session/session.service';
import { PublicApiService } from '../api/public-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(PublicApiService);
  private sessionService = inject(SessionService);

  isAuthenticated = signal(false);

  async register(payload: RegisterPayload): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.register(payload));
    if (data.token) {
      await this.sessionService.startSession(data.token);
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    const data = await firstValueFrom(this.apiService.login(credentials));
    if (data.token) {
      this.sessionService.startSession(data.token);
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  async logout() {
    await firstValueFrom(this.apiService.logout());
    this.isAuthenticated.set(false);
    this.sessionService.endSession();
  }

  async refresh() {
    try {
      const data = await firstValueFrom(this.apiService.refresh());

      if (data.token) {
        await this.sessionService.startSession(data.token);
        this.isAuthenticated.set(true);
        return true;
      }

      return false;
    } catch (err) {
      this.sessionService.endSession();
      this.isAuthenticated.set(false);
      return false;
    }
  }
}
