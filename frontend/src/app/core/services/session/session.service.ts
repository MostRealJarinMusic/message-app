import { inject, Injectable } from '@angular/core';
import { AuthTokenService } from '../auth-token/auth-token.service';
import { firstValueFrom } from 'rxjs';
import { SocketManagerService } from '../socket-manager/socket-manager.service';
import { UserService } from '../../../features/user/services/user/user.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerType } from '@common/types';
import { NavigationService } from '../navigation/navigation.service';
import { RefreshService } from '../refresh/refresh.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private tokenService = inject(AuthTokenService);
  private userService = inject(UserService);
  private socketManagerService = inject(SocketManagerService);
  private logger = inject(LoggerService);
  private navService = inject(NavigationService);
  private refreshService = inject(RefreshService);

  constructor() {
    this.logger.init(LoggerType.SERVICE_SESSION);
  }

  async startSession(token: string): Promise<void> {
    this.logger.log(LoggerType.SERVICE_SESSION, 'Starting session');

    this.tokenService.setToken(token);
    this.socketManagerService.initialiseSocket(token);
    this.refreshService.start(token);
    try {
      const user = await this.userService.loadCurrentUser();

      this.logger.log(LoggerType.SERVICE_SESSION, 'Loading current user', user);

      this.navService.start();
    } catch (err) {
      this.endSession();
      throw err;
    }
  }

  endSession(): void {
    this.refreshService.stop();
    this.tokenService.clearToken();
    this.socketManagerService.terminateSocket();
    this.userService.clearUser();
    this.navService.reset();
    this.logger.log(LoggerType.SERVICE_SESSION, 'Ending session');
  }
}
