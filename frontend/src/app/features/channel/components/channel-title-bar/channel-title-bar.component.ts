import { Component, effect, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ChannelService } from '../../services/channel/channel.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Component({
  selector: 'app-channel-title-bar',
  imports: [ButtonModule, InputIcon, IconField, InputTextModule],
  templateUrl: './channel-title-bar.component.html',
  styleUrl: './channel-title-bar.component.scss',
})
export class ChannelTitleBarComponent {
  private channelService = inject(ChannelService);
  private navService = inject(NavigationService);
  protected channelName: string | undefined;
  protected channelTopic: string | undefined;

  constructor() {
    effect(() => {
      const channelId = this.navService.currentChannelId();

      if (channelId !== null && channelId !== undefined) {
        this.channelName = this.channelService.getChannelById(channelId)?.name;
        this.channelTopic = this.channelService.getChannelById(channelId)?.topic;
      } //else {
      //   this.channelName = undefined;
      //   this.channelTopic = undefined;
      // }
    });
  }
}
