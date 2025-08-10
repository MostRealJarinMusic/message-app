import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { PresenceStatus, PresenceUpdate, WSEventType } from '@common/types';
import { PrivateApiService } from '../../../../core/services/api/private-api.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private socketService = inject(SocketService);
  private serverService = inject(ServerService);
  private apiService = inject(PrivateApiService);

  public presenceMap = signal(new Map<string, PresenceStatus>());

  constructor() {
    this.initWebSocket();

    effect(() => {
      const currentServer = this.serverService.currentServer();
      if (currentServer) {
        this.loadServerUserPresences(currentServer);
      }
    });
  }

  private initWebSocket() {
    this.socketService.on(WSEventType.PRESENCE).subscribe({
      next: (update) => {
        this.handlePresenceUpdate(update);
      },
      error: (err) => {
        console.error('Error with presence update', err);
      },
    });
  }

  private handlePresenceUpdate(update: PresenceUpdate) {
    const map = new Map(this.presenceMap());
    map.set(update.userId, update.status);
    this.presenceMap.set(map);
  }

  public getStatus(userId: string): PresenceStatus | undefined {
    return this.presenceMap().get(userId);
  }

  private loadServerUserPresences(serverId: string) {
    console.log('Attempting to load server presences');
    this.apiService.getServerUserPresences(serverId).subscribe({
      next: (presences) => {
        presences.forEach((update) => this.handlePresenceUpdate(update));
      },
      error: (err) => {
        console.error('Error with initial server presence payload', err);
      },
    });
  }
}
