import { Component, effect, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { UserService } from '../../services/user/user.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { PresenceService } from '../../services/presence/presence.service';
import { UserSettingsOverlayComponent } from '../user-settings-overlay/user-settings-overlay.component';
import { UserSettingsService } from '../../services/user-settings/user-settings.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

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
  private router = inject(Router);
  private authService = inject(AuthService);

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

  protected async logout() {
    await this.authService.logout();

    this.router.navigate(['/login']);
  }
}
