import { inject, Injectable, signal } from '@angular/core';
import { FriendRequest } from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);

  readonly incomingFriendRequests = signal<FriendRequest[]>([]);
  readonly outgoingFriendRequests = signal<FriendRequest[]>([]);

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {}
}
