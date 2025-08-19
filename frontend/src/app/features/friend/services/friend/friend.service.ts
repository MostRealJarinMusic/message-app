import { effect, inject, Injectable, signal } from '@angular/core';
import { LoggerType, WSEventType } from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private apiService = inject(PrivateApiService);
  private userService = inject(UserService);
  private wsService = inject(SocketService);
  private logger = inject(LoggerService);

  readonly friends = signal<string[]>([]);

  constructor() {
    this.initWebSocket();
    this.logger.init(LoggerType.SERVICE_FRIEND);

    effect(() => {
      const currentUser = this.userService.currentUser();

      if (currentUser) {
        console.log(currentUser);
        this.logger.log(LoggerType.SERVICE_FRIEND, 'Loading friends');
        this.loadFriends();
      }
    });
  }

  private initWebSocket() {
    //Listeners for friend adds and blocks
    this.wsService.on(WSEventType.FRIEND_ADD).subscribe((friend) => {
      this.friends.update((current) => [...current, friend.id]);
    });
  }

  private loadFriends() {
    this.logger.log(LoggerType.SERVICE_FRIEND, 'Loading friends');

    this.apiService.getFriends().subscribe({
      next: (friendIds) => {
        console.log(friendIds);

        this.friends.set(friendIds);
      },
    });
  }
}
