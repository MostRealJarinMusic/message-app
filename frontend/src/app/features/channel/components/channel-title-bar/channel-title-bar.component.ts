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
      this.channelName = this.channelService.getChannelById(
        this.channelService.currentChannel()!
      )?.name;

      this.channelTopic = this.channelService.getChannelById(
        this.channelService.currentChannel()!
      )?.topic;
    });
  }
}
