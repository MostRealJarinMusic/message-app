import { Component, effect, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ChannelService } from '../../services/channel/channel.service';

@Component({
  selector: 'app-channel-title-bar',
  imports: [ButtonModule, InputIcon, IconField, InputTextModule],
  templateUrl: './channel-title-bar.component.html',
  styleUrl: './channel-title-bar.component.scss',
})
export class ChannelTitleBarComponent {
  private channelService = inject(ChannelService);
  protected channelName: string | undefined;
  protected channelTopic: string | undefined;

  constructor() {
    effect(() => {
      const currentChannel = this.channelService.currentChannel();

      if (currentChannel) {
        this.channelName = this.channelService.getChannelById(currentChannel)!.name;

        this.channelTopic = this.channelService.getChannelById(currentChannel)!.topic;
      }
    });
  }
}
