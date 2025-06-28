import { inject, Injectable, signal } from '@angular/core';
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

  readonly currentUser = signal<User | null>(null);

  constructor() {
    //console.log("Session service created")

    const savedToken = this.tokenService.getSavedToken();
    if (savedToken) this.resumeSession(savedToken);
  }

  async startSession(token: string): Promise<void> {
    console.log('Starting session');
    this.tokenService.setToken(token);
    try {
      const user = await firstValueFrom(this.userService.fetchCurrentUser());
      this.currentUser.set(user);
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    console.log('Ending session');
    this.tokenService.clearToken();
    this.currentUser.set(null);
  }

  private async resumeSession(token: string): Promise<void> {
    console.log('Resuming session');
    this.tokenService.setToken(token);
    try {
      const user = await firstValueFrom(this.userService.fetchCurrentUser());
      this.currentUser.set(user);
    } catch {
      this.endSession();
    }
  }
}
