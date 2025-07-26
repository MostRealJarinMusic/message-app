import { effect, inject, Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { SessionService } from '../session/session.service';
import { AuthTokenService } from '../authtoken/auth-token.service';

@Injectable({
  providedIn: 'root',
})
export class SocketManagerService {
  private socketService = inject(SocketService);
  private tokenService = inject(AuthTokenService);

  constructor() {
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
