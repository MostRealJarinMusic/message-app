import { Component, computed, inject } from '@angular/core';
import { FriendRequestService } from '../../services/friend-request/friend-request.service';
import { FriendService } from '../../services/friend/friend.service';
import { UserService } from 'src/app/features/user/services/user/user.service';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { PresenceService } from 'src/app/features/user/services/presence/presence.service';
import { PresenceStatus } from '@common/types';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-friends-list',
  imports: [
    ButtonModule,
    InputIcon,
    IconField,
    InputTextModule,
    CommonModule,
    AvatarModule,
  ],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss',
})
export class FriendsListComponent {
  protected friendRequestService = inject(FriendRequestService);
  protected friendService = inject(FriendService);
  protected presenceService = inject(PresenceService);
  protected userService = inject(UserService);
  protected navService = inject(NavigationService);

  protected friends = computed(() => {
    const friendIds = this.friendService.friends();
    if (!friendIds) return [];

    return friendIds.map((id) => {
      return { id: id, status: this.presenceService.getStatus(id) };
    });
  });
  protected onlineFriends = computed(() => {
    const friends = this.friends();

    if (!friends) return [];

    return friends.filter((friend) => friend.status !== PresenceStatus.OFFLINE);
  });
  protected incomingRequests = this.friendRequestService.incomingFriendRequests;
  protected outgoingRequests = this.friendRequestService.outgoingFriendRequests;
}
