import { inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { PresenceStatus, PresenceUpdate, WSEventType } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private socketService = inject(SocketService);
  public presenceMap = signal(new Map<string, PresenceStatus>());
  //private message: Presence

  constructor() {
    this.socketService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
      next: (update) => this.handlePresenceUpdate(update),
      error: (err) => {
        console.error('Error with presence update', err);
      },
    });
  }

  private handlePresenceUpdate(update: PresenceUpdate) {
    const map = new Map(this.presenceMap());
    map.set(update.userId, update.status);
    this.presenceMap.set(map);

    console.log(this.presenceMap());
  }

  public getStatus(userId: string): PresenceStatus | undefined {
    return this.presenceMap().get(userId);
  }

  private handleInitialPresencePayload() {
    this.socketService
      .on<PresenceUpdate[]>(WSEventType.PRESENCE_BULK)
      .subscribe({
        next: (updates) => {
          updates.forEach((update) => this.handlePresenceUpdate(update));
        },
        error: (err) => {
          console.error('Error with initial presence payload', err);
        },
      });
  }

  // public getPresenceMap(): ReadonlyMap<string, PresenceStatus> {
  //   return this.presenceMap();
  // }
}
