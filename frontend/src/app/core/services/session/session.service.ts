import { inject, Injectable } from '@angular/core';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { firstValueFrom } from 'rxjs';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
import { UserService } from '../../../features/user/services/user/user.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerType } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private tokenService = inject(AuthTokenService);
  private userService = inject(UserService);
  private socketManagerService = inject(SocketManagerService);
  private logger = inject(LoggerService);

  constructor() {
    this.logger.init(LoggerType.SERVICE_SESSION);
  }

  async startSession(token: string): Promise<void> {
    this.logger.log(LoggerType.SERVICE_SESSION, 'Starting session');

    this.tokenService.setToken(token);
    this.socketManagerService.initialiseSocket(token);
    try {
      await this.userService.loadCurrentUser();

      this.logger.log(LoggerType.SERVICE_SESSION, 'Loading current user');
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    this.tokenService.clearToken();
    this.socketManagerService.terminateSocket();
    //this.currentUser.set(null);

    //Tell user service to set current user to null
  }

  async attemptResumeSession(): Promise<void> {
    const savedToken = this.tokenService.getSavedToken();
    if (!savedToken) return;

    this.logger.log(LoggerType.SERVICE_SESSION, 'Resuming session');
    this.tokenService.setToken(savedToken);
    this.socketManagerService.initialiseSocket(savedToken);

    try {
      await this.userService.loadCurrentUser();
      this.logger.log(LoggerType.SERVICE_SESSION, 'Loading current user');
    } catch {
      this.endSession();
    }
  }
}
