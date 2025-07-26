import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { PresenceStatus, PresenceUpdate, WSEventType } from '@common/types';
import { ServerService } from '../server/server.service';
import { PrivateApiService } from '../api/private-api.service';

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
    this.socketService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
      next: (update) => this.handlePresenceUpdate(update),
      error: (err) => {
        console.error('Error with presence update', err);
      },
    });

    // this.socketService
    //   .on<PresenceUpdate[]>(WSEventType.PRESENCE_BATCH)
    //   .subscribe({
    //     next: (updates) => {
    //       updates.forEach((update) => this.handlePresenceUpdate(update));
    //     },
    //     error: (err) => {
    //       console.error('Error with initial presence payload', err);
    //     },
    //   });
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
    this.apiService.getServerUserPresences(serverId).subscribe({
      next: (presences) => {
        console.log(presences);
        presences.forEach((update) => this.handlePresenceUpdate(update));
      },
      error: (err) => {
        console.error('Error with initial server presence payload', err);
      },
    });
  }

  // public getPresenceMap(): ReadonlyMap<string, PresenceStatus> {
  //   return this.presenceMap();
  // }
}
