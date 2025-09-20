import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthPayload, LoginCredentials, RegisterPayload } from '@common/types';
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
}
