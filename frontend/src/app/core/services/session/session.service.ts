import { inject, Injectable } from '@angular/core';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { firstValueFrom } from 'rxjs';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
import { UserService } from '../../../features/user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private tokenService = inject(AuthTokenService);
  private userService = inject(UserService);
  private socketManagerService = inject(SocketManagerService);

  readonly currentUser = this.userService.currentUser;

  constructor() {
    const savedToken = this.tokenService.getSavedToken();
    if (savedToken) this.resumeSession(savedToken);
  }

  async startSession(token: string): Promise<void> {
    this.tokenService.setToken(token);
    this.socketManagerService.initialiseSocket(token);
    try {
      await firstValueFrom(this.userService.fetchCurrentUser());
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    this.tokenService.clearToken();
    this.socketManagerService.terminateSocket();
    this.currentUser.set(null);
  }

  private async resumeSession(token: string): Promise<void> {
    this.tokenService.setToken(token);
    this.socketManagerService.initialiseSocket(token);
    try {
      await firstValueFrom(this.userService.fetchCurrentUser());
    } catch {
      this.endSession();
    }
  }
}
