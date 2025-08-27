import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PresenceStatus } from '@common/types';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';
import { PresenceService } from 'src/app/features/user/services/presence/presence.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, AvatarModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  protected presenceService = inject(PresenceService);
  protected userService = inject(UserService);
  private navService = inject(NavigationService);
  private channelService = inject(ChannelService);

  protected serverUsers = this.userService.serverUsers;
  protected presenceEntries = computed(() => {
    const serverId = this.navService.activeServerId();
    const dmId = this.navService.activeDMId();

    if (!serverId && !dmId) return [];

    if (serverId) {
      const users = this.userService.serverUsers();

      if (!users) {
        return [];
      }
      return users.map((user) => {
        return { id: user.id, status: this.presenceService.getStatus(user.id)! };
      });
    } else if (dmId) {
      const dmChannel = this.channelService.getChannelById(dmId);

      if (!dmChannel) return [];
      if (!dmChannel.participants || dmChannel.participants.length !== 2) return [];
      return dmChannel.participants.map((id) => {
        return { id, status: this.presenceService.getStatus(id)! };
      });
    }

    return [];
  });
}
