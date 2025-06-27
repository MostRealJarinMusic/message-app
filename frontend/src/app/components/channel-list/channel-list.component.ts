import { Component, inject, Signal } from '@angular/core';
import { Channel } from '@common/types';
import { ButtonModule } from 'primeng/button';
import { ChannelService } from 'src/app/services/channel/channel.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-channel-list',
  imports: [ButtonModule],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
})
export class ChannelListComponent {
  private channelService = inject(ChannelService);

  channels: Signal<Channel[]> = toSignal(this.channelService.channels$, {
    initialValue: [],
  });
  currentChannelId: Signal<string | null> = toSignal(
    this.channelService.currentChannelId$,
    {
      initialValue: null,
    }
  );

  selectChannel(id: string) {
    this.channelService.selectChannel(id);
  }
}
