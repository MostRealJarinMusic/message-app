import { inject, Injectable, signal } from '@angular/core';
import { WSEventType } from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);

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
    this.apiService.getFriends().subscribe({
      next: (friendIds) => {
        this.friends.set(friendIds);

        //console.log('Friends: ', this.friends());
      },
    });
  }
}
