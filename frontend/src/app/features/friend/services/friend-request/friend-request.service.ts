import { computed, inject, Injectable, signal } from '@angular/core';
import {
  FriendRequest,
  FriendRequestCreate,
  FriendRequestStatus,
  FriendRequestUpdate,
  WSEventType,
} from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private userService = inject(UserService);

  readonly friendRequests = signal<FriendRequest[]>([]);
  readonly incomingFriendRequests = computed(() => {
    const userId = this.userService.currentUser()!.id;
    return this.friendRequests().filter((r) => r.receiverId === userId) ?? [];
  });
  readonly outgoingFriendRequests = computed(() => {
    const userId = this.userService.currentUser()!.id;
    return this.friendRequests().filter((r) => r.senderId === userId) ?? [];
  });

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    //Listeners for friend request sending, receiving, updates and deletes
    const addRequest = (request: FriendRequest) => {
      this.friendRequests.update((current) => [...current, request]);
    };

    const removeRequest = (request: FriendRequest) => {
      this.friendRequests.update((current) =>
        current.filter((r) => r.id !== request.id)
      );
    };

    this.wsService.on(WSEventType.FRIEND_REQUEST_SENT).subscribe(addRequest);
    this.wsService.on(WSEventType.FRIEND_REQUEST_RECEIVE).subscribe(addRequest);

    this.wsService
      .on(WSEventType.FRIEND_REQUEST_UPDATE)
      .subscribe((request) => {
        const userId = this.userService.currentUser()!.id;

        if (this.friendRequests().some((r) => r.id === request.id)) {
          //Friend request is valid - either incoming or outgoing
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
          }

          removeRequest(request);
        }

        // if (
        //   userId === request.senderId &&
        //   this.outgoingFriendRequests().some((r) => r.id === request.id)
        // ) {
        //   //My friend request has been updated
        //   if (request.status === FriendRequestStatus.ACCEPTED) {
        //     //Accepted toast here
        //     console.log(
        //       `Friend request to user ${request.receiverId} accepted`
        //     );
        //   } else {
        //     console.log(
        //       `Friend request to user ${request.receiverId} rejected`
        //     );
        //   }

        //   //Delete from outgoing
        //   this.outgoingFriendRequests.update((current) =>
        //     current.filter((r) => r.id !== request.id)
        //   );
        // }

        // if (
        //   userId === request.receiverId &&
        //   this.incomingFriendRequests().some((r) => r.id === request.id)
        // ) {
        //   this.incomingFriendRequests.update((current) =>
        //     current.filter((r) => r.id !== request.id)
        //   );
        // }
      });

    this.wsService
      .on(WSEventType.FRIEND_REQUEST_DELETE)
      .subscribe(removeRequest);
  }

  public sendFriendRequest(targetId: string) {
    const newFriendRequest: FriendRequestCreate = {
      targetId,
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
        console.log('Successful friend request deleton');
      },
      error: (err) => {
        console.log('Unsuccessful friend request deletion', err);
      },
    });
  }
}
