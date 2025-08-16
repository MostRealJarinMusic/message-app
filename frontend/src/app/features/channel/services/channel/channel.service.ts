import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Channel, ChannelCreate, ChannelUpdate, LoggerType, WSEventType } from '@common/types';
import { ChannelCategoryService } from 'src/app/features/category/services/channel-category/channel-category.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
  private wsService = inject(SocketService);
  private categoryService = inject(ChannelCategoryService);
  private navService = inject(NavigationService);
  private logger = inject(LoggerService);

  readonly currentChannel = signal<string | null>(null);
  readonly channels = signal<Channel[]>([]);
  readonly currentChannelName = computed(
    () => this.channels()!.find((channel) => channel.id === this.currentChannel())?.name,
  );
  readonly groupedChannels = computed(() => {
    const map = new Map<string | null, Channel[]>();

    for (const channel of this.channels()!) {
      const key = channel.categoryId ?? null;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(channel);
    }

    return map;
  });

  constructor() {
    this.initWebSocket();

    //Load channels
    effect(() => {
      const currentServer = this.navService.currentServerId();
      const currentCategories = this.categoryService.channelCategories();
      if (currentServer && currentCategories) {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'Loading channels');
        this.loadServerChannels(currentServer);
      } else {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'No server');
        this.currentChannel.set(null);
        this.channels.set([]);
      }
    });
  }

  selectChannel(id: string | null) {
    this.currentChannel.set(id);
  }

  private loadServerChannels(serverId: string) {
    this.apiService.getChannels(serverId).subscribe({
      next: (channels) => {
        this.channels.set(channels);

        this.navService.setChildren(
          serverId,
          this.channels().map((c) => {
            return { id: c.id };
          }),
        );

        if (
          (!this.currentChannel() ||
            !this.channels()!
              .map((channel) => channel.id)
              .includes(this.currentChannel()!)) &&
          channels.length > 0
        ) {
          this.selectChannel(channels[0].id);
        }
      },
      error: (err) => this.logger.error(LoggerType.SERVICE_CHANNEL, 'Failed to load channels', err),
    });
  }

  public createChannel(channelName: string, categoryId: string | null) {
    const newChannelData: ChannelCreate = {
      name: channelName,
      categoryId: categoryId,
    };

    this.apiService.createChannel(this.navService.currentServerId()!, newChannelData).subscribe({
      next: (channel) => {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'Successfuly channel creation');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CHANNEL, 'Failed to create channel:', err);
      },
    });
  }

  public editChannel(channelid: string, channelUpdate: ChannelUpdate) {
    this.apiService.editChannel(channelid, channelUpdate).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'Succcessful edit');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CHANNEL, 'Unsuccessful edit', err);
      },
    });
  }

  public deleteChannel(channelId: string) {
    this.apiService.deleteChannel(channelId).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'Successful channel deletion');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CHANNEL, 'Unsuccessful channel deletion', err);
      },
    });
  }

  private initWebSocket(): void {
    //Listeners for channel creation, edits and deletes
    this.wsService.on(WSEventType.CHANNEL_CREATE).subscribe((channel) => {
      if (channel.serverId === this.navService.currentServerId()) {
        this.channels.update((current) => [...current!, channel]);
      }

      this.navService.addChildren(channel.serverId, [{ id: channel.id }]);
    });

    //Deletes
    this.wsService.on(WSEventType.CHANNEL_DELETE).subscribe((channel) => {
      if (channel.serverId === this.navService.currentServerId()) {
        this.channels.update((current) => current!.filter((c) => c.id !== channel.id));
      }

      this.navService.deleteChild(channel.serverId, channel.id);

      if (channel.id === this.currentChannel()) {
        if (this.channels().length > 0) {
          this.selectChannel(this.channels()[0].id);
        } else {
          this.selectChannel(null);
        }
      }
    });

    //Edits
    this.wsService.on(WSEventType.CHANNEL_UPDATE).subscribe((channel) => {
      if (channel.serverId === this.navService.currentServerId()) {
        this.channels.update((currentChannels) =>
          currentChannels!.map((c) => (c.id === channel.id ? { ...c, ...channel } : c)),
        );
      }
    });
  }

  getChannelById(id: string): Channel | undefined {
    return this.channels()!.find((channel) => channel.id === id);
  }
}
