import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { Channel } from '@common/types';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-channel-button',
  imports: [CommonModule, ContextMenuModule],
  templateUrl: './channel-button.component.html',
  styleUrl: './channel-button.component.scss',
})
export class ChannelButtonComponent {
  channel = input<Channel | null>(null);
  isSelected = input(false);

  select = output<string>();
  openContextMenu = output<MouseEvent>();

  onClick() {
    this.select.emit(this.channel()!.id);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.openContextMenu.emit(event);
  }
}
