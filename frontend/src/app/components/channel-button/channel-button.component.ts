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
export class ChannelButtonComponent implements OnInit {
  items: MenuItem[] = [];

  channel = input<Channel | null>(null);
  isSelected = input(false);

  select = output<string>();

  onClick() {
    this.select.emit(this.channel()!.id);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  ngOnInit(): void {
    this.items = [
      { label: 'Delete Channel', icon: 'pi pi-pencil' },
      { label: 'Edit Channel', icon: 'pi pi-trash' },
    ];
  }
}
