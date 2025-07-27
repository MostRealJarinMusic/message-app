import { Component, computed, inject } from '@angular/core';
import { PresenceStatus } from '@common/types';
import { PresenceService } from 'src/app/services/presence/presence.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-list',
  imports: [],
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
      return { id: user.id, status: this.presenceService.getStatus(user.id) };
    });
  });
}
