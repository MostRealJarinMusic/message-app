import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { LoggerType, PresenceStatus, PresenceUpdate, WSEventType } from '@common/types';
import { PrivateApiService } from '../../../../core/services/api/private-api.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private socketService = inject(SocketService);
  private navService = inject(NavigationService);
  private apiService = inject(PrivateApiService);
  private logger = inject(LoggerService);

  public presenceMap = signal(new Map<string, PresenceStatus>());

  constructor() {
    this.initWebSocket();

    effect(() => {
      const currentServer = this.navService.serverId();
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
        this.logger.error(LoggerType.SERVICE_PRESENCE, 'Error with presence update', err);
      },
    });
  }

  private handlePresenceUpdate(update: PresenceUpdate) {
    const map = new Map(this.presenceMap());
    map.set(update.userId, update.status);
    this.presenceMap.set(map);
  }

  public getStatus(userId: string): PresenceStatus {
    return this.presenceMap().get(userId) ?? PresenceStatus.OFFLINE;
  }

  private loadServerUserPresences(serverId: string) {
    this.logger.log(LoggerType.SERVICE_PRESENCE, 'Attempting to load server presences');
    this.apiService.getServerUserPresences(serverId).subscribe({
      next: (presences) => {
        presences.forEach((update) => this.handlePresenceUpdate(update));
      },
      error: (err) => {
        this.logger.error(
          LoggerType.SERVICE_PRESENCE,
          'Error with initial server presence payload',
          err,
        );
      },
    });
  }

  getAvatarStyle(status: PresenceStatus) {
    return {
      'background-color': status === PresenceStatus.ONLINE ? '#10B981' : '#6B7280',
      color: '#ffffff',
    };
  }
}
