import { Component, effect, inject } from '@angular/core';
import { ChannelService } from 'src/app/services/channel/channel.service';

@Component({
  selector: 'app-channel-title-bar',
  imports: [],
  templateUrl: './channel-title-bar.component.html',
  styleUrl: './channel-title-bar.component.scss',
})
export class ChannelTitleBarComponent {
  private channelService = inject(ChannelService);
  protected channelName: string | undefined;

  constructor() {
    effect(() => {
      this.channelName = this.channelService.getChannelById(
        this.channelService.currentChannel()!
      )?.name;
    });
  }
}
