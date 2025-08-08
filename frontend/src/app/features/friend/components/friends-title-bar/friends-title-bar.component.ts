import { Component, inject } from '@angular/core';
import { FriendRequestService } from '../../services/friend-request/friend-request.service';
import { FriendService } from '../../services/friend/friend.service';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-friends-title-bar',
  imports: [ButtonModule, IconField, CommonModule],
  templateUrl: './friends-title-bar.component.html',
  styleUrl: './friends-title-bar.component.scss',
})
export class FriendsTitleBarComponent {
  private friendRequestService = inject(FriendRequestService);
  private friendService = inject(FriendService);
}
