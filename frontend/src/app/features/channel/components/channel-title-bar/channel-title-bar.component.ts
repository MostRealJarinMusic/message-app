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
  protected channelName: string = '';
  protected channelTopic: string = '';

  constructor() {
    effect(() => {
      const channelId = this.navService.activeChannelId();
      const dmId = this.navService.activeDMId();

      if (!channelId && !dmId) {
        this.channelName = '';
        this.channelTopic = '';
        return;
      }

      if (channelId) {
        const channel = this.channelService.getChannelById(channelId);

        if (!channel) {
          this.channelName = '';
          this.channelTopic = '';
          return;
        }

        this.channelName = channel.name;
        this.channelTopic = channel.topic ?? '';
      } else if (dmId) {
        const dmChannel = this.channelService.getChannelById(dmId);

        if (!dmChannel) {
          this.channelName = '';
          this.channelTopic = '';
          return;
        }

        this.channelName = dmChannel.name;
        this.channelTopic = '';
      }
    });
  }
}
