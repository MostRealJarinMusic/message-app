import { Component, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { ListboxModule } from 'primeng/listbox';
import { NgClass, NgIf } from '@angular/common';
@Component({
  selector: 'app-channel-list',
  imports: [ButtonModule, FormsModule, ListboxModule, NgClass],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
})
export class ChannelListComponent {
  private channelService = inject(ChannelService);

  protected channels = this.channelService.channels;
  protected currentChannel = this.channelService.currentChannel;

  selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }

  onChannelChange(event: any) {
    const selected: Channel = event.value;
    this.selectChannel(selected.id);
  }
}
