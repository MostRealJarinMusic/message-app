import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Channel, ChannelCreate } from '@common/types';
import { PrivateApiService } from '../api/private-api.service';
import { ServerService } from '../server/server.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);

  readonly currentChannel = signal<string | null>(null);
  readonly channels = signal<Channel[]>([]);
  readonly currentChannelName = computed(
    () =>
      this.channels().find((channel) => channel.id === this.currentChannel())
        ?.name
  );

  constructor() {
    //Load channels
    effect(() => {
      const currentServer = this.serverService.currentServer();
      if (currentServer) {
        this.loadChannels(currentServer);
      }
    });
  }

  selectChannel(id: string) {
    this.currentChannel.set(id);
  }

  private loadChannels(serverId: string) {
    this.apiService.getChannels(serverId).subscribe({
      next: (channels) => {
        this.channels.set(channels);

        if (
          (!this.currentChannel() ||
            !this.channels()
              .map((channel) => channel.id)
              .includes(this.currentChannel()!)) &&
          channels.length > 0
        ) {
          this.selectChannel(channels[0].id);
        }
      },
      error: (err) => console.error('Failed to load channels', err),
    });
  }
}
