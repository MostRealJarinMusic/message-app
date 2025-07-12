import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Channel, ChannelCreate, WSEventType } from '@common/types';
import { PrivateApiService } from '../api/private-api.service';
import { ServerService } from '../server/server.service';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
  private wsService = inject(SocketService);

  readonly currentChannel = signal<string | null>(null);
  readonly channels = signal<Channel[]>([]);
  readonly currentChannelName = computed(
    () =>
      this.channels().find((channel) => channel.id === this.currentChannel())
        ?.name
  );

  constructor() {
    this.initWebSocket();

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

  public createChannel(channelName: string, categoryId: string) {
    const newChannelData: ChannelCreate = {
      name: channelName,
      categoryId: categoryId,
    };

    this.apiService
      .createChannel(this.serverService.currentServer()!, newChannelData)
      .subscribe({
        next: (channel) => {
          console.log('Successfuly channel creation');
        },
        error: (err) => {
          console.error('Failed to create channel:', err);
        },
      });
  }

  public deleteChannel(channelId: string) {
    this.apiService.deleteChannel(channelId).subscribe({
      next: () => {
        console.log('Successful channel deletion');
      },
      error: (err) => {
        console.error('Unsuccessful channel deletion', err);
      },
    });
  }

  private initWebSocket(): void {
    //Listeners for channel creation, edits and deletes
    this.wsService
      .on<Channel>(WSEventType.CHANNEL_CREATE)
      .subscribe((channel) => {
        if (channel.serverId === this.serverService.currentServer()) {
          this.channels.update((current) => [...current, channel]);
        }
      });

    //Deletes
    this.wsService
      .on<Channel>(WSEventType.CHANNEL_DELETE)
      .subscribe((channel) => {
        console.log(channel);

        if (
          channel.id === this.currentChannel() &&
          this.channels().length > 0
        ) {
          this.selectChannel(this.channels()[0].id);
        }

        if (channel.serverId === this.serverService.currentServer()) {
          this.channels.update((current) =>
            current.filter((c) => c.id !== channel.id)
          );
        }
      });
  }
}
