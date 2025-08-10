import { Component, inject } from '@angular/core';
import { FriendRequestService } from '../../services/friend-request/friend-request.service';
import { FriendService } from '../../services/friend/friend.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-friends-list',
  imports: [],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.scss',
})
export class FriendsListComponent {
  protected friendRequestService = inject(FriendRequestService);
  protected friendService = inject(FriendService);
  protected userService = inject(UserService);
}
