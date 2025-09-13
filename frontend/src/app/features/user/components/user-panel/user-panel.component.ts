import { Component, effect, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { UserService } from '../../services/user/user.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { PresenceService } from '../../services/presence/presence.service';
import { UserSettingsOverlayComponent } from '../user-settings-overlay/user-settings-overlay.component';
import { UserSettingsService } from '../../services/user-settings/user-settings.service';

@Component({
  selector: 'app-user-panel',
  imports: [CardModule, ButtonModule, CommonModule, AvatarModule, UserSettingsOverlayComponent],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent {
  private userService = inject(UserService);
  protected userSettingsService = inject(UserSettingsService);
  protected presenceService = inject(PresenceService);

  protected username = '';
  protected bio = '';

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();

      if (!user) {
        this.username = '';
        this.bio = '';
        return;
      }

      this.username = user.username;
      this.bio = user.bio;
    });
  }
}
