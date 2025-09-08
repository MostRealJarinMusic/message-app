import { Component, effect, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-user-panel',
  imports: [CardModule],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent {
  private userService = inject(UserService);

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
