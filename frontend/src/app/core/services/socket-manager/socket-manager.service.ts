import { effect, inject, Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { AuthTokenService } from '../authtoken/auth-token.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerType } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class SocketManagerService {
  private socketService = inject(SocketService);
  private tokenService = inject(AuthTokenService);
  private logger = inject(LoggerService);

  constructor() {
    this.logger.init(LoggerType.SERVICE_SOCKET_MANAGER);

    effect(() => {
      const token = this.tokenService.getToken();

      if (token && !this.socketService.isConnected) {
        this.socketService.connect(token);
      } else if (!token && this.socketService.isConnected) {
        this.socketService.disconnect();
      }
    });
  }

  initialiseSocket(token: string) {
    this.socketService.connect(token);
  }

  terminateSocket() {
    this.socketService.disconnect();
  }
}
