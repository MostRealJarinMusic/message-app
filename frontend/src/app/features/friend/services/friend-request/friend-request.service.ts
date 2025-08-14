import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  FriendRequest,
  FriendRequestCreate,
  FriendRequestStatus,
  FriendRequestUpdate,
  WSEventType,
} from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
    private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private userService = inject(UserService);
  private navService = inject(NavigationService);

  readonly incomingFriendRequests = signal<FriendRequest[]>([]);
  readonly outgoingFriendRequests = signal<FriendRequest[]>([]);

  //private directMessagesView = this.navService.isActive('direct-')

  constructor() {
    this.initWebSocket();
    this.loadFriendRequests();
  }

  private loadFriendRequests() {
    this.apiService.getIncomingFriendRequests().subscribe({
      next: (incomingRequests) => {
        this.incomingFriendRequests.set(incomingRequests);
      }
    });

    this.apiService.getOutgoingFriendRequests().subscribe({
      next: (outgoingRequests) => {
        this.outgoingFriendRequests.set(outgoingRequests);
      }
    })
  }

  private initWebSocket() {
    //Listeners for friend request sending, receiving, updates and deletes
    const addRequest = (request: FriendRequest, requestStore: WritableSignal<FriendRequest[]>) => {
      requestStore.update((current) => [...current, request]);
    };

    const removeRequest = (request: FriendRequest, requestStore: WritableSignal<FriendRequest[]>) => {
      requestStore.update((current) =>
        current.filter((r) => r.id !== request.id)
      );
    };

    this.wsService.on(WSEventType.FRIEND_REQUEST_SENT).subscribe(r => addRequest(r, this.outgoingFriendRequests));
    this.wsService.on(WSEventType.FRIEND_REQUEST_RECEIVE).subscribe(r => addRequest(r, this.incomingFriendRequests));

    this.wsService
      .on(WSEventType.FRIEND_REQUEST_UPDATE)
      .subscribe((request) => {
        const userId = this.userService.currentUser()!.id;

        if (userId === request.senderId) {
          //My friend request to another user has been updated
          if (request.status === FriendRequestStatus.ACCEPTED) {
            //Accepted toast here
            console.log(
              `Friend request to user ${request.receiverId} accepted`
            );
          } else {
            console.log(
              `Friend request to user ${request.receiverId} rejected`
            );
          }

          removeRequest(request, this.outgoingFriendRequests);
        } else {
          removeRequest(request, this.incomingFriendRequests);
        }
      });

    this.wsService
      .on(WSEventType.FRIEND_REQUEST_DELETE)
      .subscribe((request) => {
        console.log('Friend request delete triggered')

        const userId = this.userService.currentUser()!.id;

        if (userId === request.senderId) {
          removeRequest(request, this.outgoingFriendRequests);
        } else {
          removeRequest(request, this.incomingFriendRequests);
        }
      });
  }

  public sendFriendRequest(targetUsername: string) {
    const newFriendRequest: FriendRequestCreate = {
      targetUsername,
    };

    this.apiService.sendFriendRequest(newFriendRequest).subscribe({
      next: () => {
        console.log('Succcessful friend request creation');
      },
      error: (err) => {
        console.log('Unsuccessful friend request creation', err);
      },
    });
  }

  public updateFriendRequest(
    requestId: string,
    newStatus: FriendRequestStatus
  ) {
    const friendRequestUpdate: FriendRequestUpdate = {
      id: requestId,
      status: newStatus,
    };

    this.apiService
      .updateFriendRequest(requestId, friendRequestUpdate)
      .subscribe({
        next: () => {
          console.log('Succcessful friend request update');
        },
        error: (err) => {
          console.log('Unsuccessful friend request update', err);
        },
      });
  }

  public cancelFriendRequest(requestId: string) {
    this.apiService.cancelFriendRequest(requestId).subscribe({
      next: () => {
        console.log('Successful friend request deletion');
      },
      error: (err) => {
        console.log('Unsuccessful friend request deletion', err);
      },
    });
  }
}