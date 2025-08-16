import { inject, Injectable, signal } from '@angular/core';
import { LoggerType, WSEventType } from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private logger = inject(LoggerService);

  readonly friends = signal<string[]>([]);

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    //Listeners for friend adds and blocks
    this.wsService.on(WSEventType.FRIEND_ADD).subscribe((friend) => {
      this.friends.update((current) => [...current, friend.id]);
    });
  }

  loadFriends() {
    this.logger.log(LoggerType.SERVICE_FRIEND, 'Loading friends');

    this.apiService.getFriends().subscribe({
      next: (friendIds) => {
        this.friends.set(friendIds);
      },
    });
  }
}
