import { Component, effect, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { UserService } from '../../services/user/user.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { PresenceService } from '../../services/presence/presence.service';

@Component({
  selector: 'app-user-panel',
  imports: [CardModule, ButtonModule, CommonModule, AvatarModule],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent {
  private userService = inject(UserService);
  protected presenceService = inject(PresenceService);

  protected username = '';

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();

      if (!user) {
        this.username = '';
        return;
      }

      this.username = user.username;
    });
  }
}
