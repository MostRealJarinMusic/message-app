import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@common/types';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { UserService } from '../user/user.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private tokenService = inject(AuthTokenService);
  private userService = inject(UserService);

  readonly currentUser = this.userService.currentUser;

  constructor() {
    const savedToken = this.tokenService.getSavedToken();
    if (savedToken) this.resumeSession(savedToken);
  }

  async startSession(token: string): Promise<void> {
    this.tokenService.setToken(token);
    try {
      await firstValueFrom(this.userService.fetchCurrentUser());
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    this.tokenService.clearToken();
    this.currentUser.set(null);
  }

  private async resumeSession(token: string): Promise<void> {
    this.tokenService.setToken(token);
    try {
      await firstValueFrom(this.userService.fetchCurrentUser());
    } catch {
      this.endSession();
    }
  }
}
