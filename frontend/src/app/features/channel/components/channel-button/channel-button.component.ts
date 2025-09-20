import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { Channel, ChannelType } from '@common/types';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Component({
  selector: 'app-channel-button',
  imports: [CommonModule, ContextMenuModule],
  templateUrl: './channel-button.component.html',
  styleUrl: './channel-button.component.scss',
})
export class ChannelButtonComponent {
  private userService = inject(UserService);

  channel = input<Channel | null>(null);
  isSelected = input(false);

  select = output<string>();
  openContextMenu = output<MouseEvent>();

  protected label = '';

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();
      if (!user) return;

      const channel = this.channel();

      if (!channel) return;

      if (channel.type !== ChannelType.DM) {
        this.label = `# ${channel.name}`;
        return;
      }

      if (!channel.participants || channel.participants.length !== 2) return;

      if (channel.participants[0] === user.id) {
        this.label = `${this.userService.getUsername(channel.participants[1])}`;
      } else {
        this.label = `${this.userService.getUsername(channel.participants[0])}`;
      }
    });
  }

  onClick() {
    this.select.emit(this.channel()!.id);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.openContextMenu.emit(event);
  }
}
