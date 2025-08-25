import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Channel, ChannelCreate, ChannelUpdate, LoggerType, WSEventType } from '@common/types';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private apiService = inject(PrivateApiService);
  private wsService = inject(SocketService);
  private navService = inject(NavigationService);
  private logger = inject(LoggerService);

  readonly channels = signal<Channel[]>([]);
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

  readonly dmChannels = signal<Channel[]>([]);

  private channelCache: Map<string, Channel[]> = new Map(); //Prevents misses while the channel is getting fetched - waterfall issue
  private lastServerId: string | null = null;

  constructor() {
    this.logger.init(LoggerType.SERVICE_CHANNEL);

    this.initWebSocket();

    //Load channels
    effect(() => {
      const currentServer = this.navService.activeServerId();

      if (currentServer === this.lastServerId) return;
      this.lastServerId = currentServer;

      if (currentServer) {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'Loading channels');

        this.loadServerChannels(currentServer);
      } else {
        this.logger.log(LoggerType.SERVICE_CHANNEL, 'No server - loading DMs');

        this.loadDMChannels();
      }
    });
  }

  private loadServerChannels(serverId: string) {
    this.apiService.getServerChannels(serverId).subscribe({
      next: (channels) => {
        this.channels.set(channels);
        this.navService.addChannels(serverId, channels);
      },
      error: (err) => this.logger.error(LoggerType.SERVICE_CHANNEL, 'Failed to load channels', err),
    });
  }

  private loadDMChannels() {
    this.apiService.getDMChannels().subscribe({
      next: (channels) => {
        //Set them
        console.log(channels);
        //Add DM channels
      },
      error: (err) =>
        this.logger.error(LoggerType.SERVICE_CHANNEL, 'Failed to load DM channels', err),
    });
  }

  public createChannel(channelName: string, categoryId: string | null) {
    const newChannelData: ChannelCreate = {
      name: channelName,
      categoryId: categoryId,
    };

    this.apiService.createChannel(this.navService.activeServerId()!, newChannelData).subscribe({
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
      if (channel.serverId === this.navService.activeServerId()) {
        this.channels.update((current) => [...current!, channel]);
      }

      this.navService.addChannels(channel.serverId!, [channel]);
    });

    //Deletes
    this.wsService.on(WSEventType.CHANNEL_DELETE).subscribe((channel) => {
      if (channel.serverId === this.navService.activeServerId()) {
        this.channels.update((current) => current!.filter((c) => c.id !== channel.id));
      }

      this.navService.removeChannel(channel.serverId!, channel.id);
    });

    //Edits
    this.wsService.on(WSEventType.CHANNEL_UPDATE).subscribe((channel) => {
      if (channel.serverId === this.navService.activeServerId()) {
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
