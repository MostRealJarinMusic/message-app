import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PresenceStatus } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { PresenceService } from 'src/app/features/user/services/presence/presence.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, AvatarModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  private presenceService = inject(PresenceService);
  protected userService = inject(UserService);

  protected serverUsers = this.userService.serverUsers;
  protected presenceEntries = computed(() => {
    const users = this.serverUsers();

    if (!users) {
      return [];
    }
    return users.map((user) => {
      return { id: user.id, status: this.presenceService.getStatus(user.id)! };
    });
  });

  protected getAvatarStyle(status: PresenceStatus) {
    return {
      'background-color':
        status === PresenceStatus.ONLINE ? '#10B981' : '#6B7280',
      color: '#ffffff',
    };
  }
}
