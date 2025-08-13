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
import { FriendRequestStatus, PresenceStatus } from '@common/types';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-friends-list',
  imports: [
    ButtonModule,
    InputIcon,
    IconField,
    InputTextModule,
    CommonModule,
    AvatarModule,
    FormsModule,
    ReactiveFormsModule,
    TextareaModule,
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
  private formBuilder = inject(FormBuilder);

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

  protected friendRequestForm = this.formBuilder.group({
    username: new FormControl<string>('')
  })


  protected sendFriendRequest() {
    if (this.friendRequestForm.valid && this.friendRequestForm.value.username) {
      this.friendRequestService.sendFriendRequest(this.friendRequestForm.value.username)
    }
  }  

  protected acceptFriendRequest(requestId: string) {
    this.friendRequestService.updateFriendRequest(requestId, FriendRequestStatus.ACCEPTED);
  }

  protected rejectFriendRequest(requestId: string) {
    this.friendRequestService.updateFriendRequest(requestId, FriendRequestStatus.REJECTED);
  }

  protected cancelFriendRequest(requestId: string) {
    this.friendRequestService.cancelFriendRequest(requestId);
  }
}
