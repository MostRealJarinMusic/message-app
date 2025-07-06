import { computed, inject, Injectable, signal } from '@angular/core';
import { Channel, ChannelCategory } from '@common/types';
import { PrivateApiService } from '../api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);

  readonly currentChannel = signal<string | null>(null);
  readonly channels = signal<Channel[]>([]);
  readonly currentChannelName = computed(
    () =>
      this.channels().find((channel) => channel.id === this.currentChannel())
        ?.name
  );

  readonly categories = signal<ChannelCategory[]>([]);

  selectChannel(id: string) {
    this.currentChannel.set(id);
  }

  loadChannels(serverId: string) {
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

  loadStructure(serverId: string) {
    this.apiService.getServerStructure(serverId).subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => console.error('Failed to load server structure', err),
    });
  }
}
