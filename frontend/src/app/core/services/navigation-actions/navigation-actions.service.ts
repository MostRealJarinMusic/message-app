import { inject, Injectable } from '@angular/core';
import { NavigationTreeService } from '../navigation-tree/navigation-tree.service';
import { NavigationStateService } from '../navigation-state/navigation-state.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerType, NavigationNode } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class NavigationActionsService {
  private treeService = inject(NavigationTreeService);
  private stateService = inject(NavigationStateService);
  private logger = inject(LoggerService);

  constructor() {}

  addServer(server: { id: string; name: string; channels?: any[] }): void {
    const serverNode: NavigationNode = {
      id: server.id,
      type: 'server',
      label: server.name,
      metadata: { serverData: server },
      children:
        server.channels?.map((channel) => ({
          id: channel.id,
          type: 'channel' as const,
          label: channel.name,
          metadata: { channelData: channel },
        })) || [],
      activeChildId: server.channels?.[0]?.id,
    };

    this.treeService.addNode('servers', serverNode);

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Added server:', server.id);
  }

  removeServer(serverId: string): void {
    const wasActive = this.stateService.serverId() === serverId;
    this.treeService.removeNode(serverId);

    if (wasActive) {
      this.handleServerDeletion(serverId);
    }

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Removed server:', serverId);
  }

  addChannel(serverId: string, channel: { id: string; name: string }): void {
    const channelNode: NavigationNode = {
      id: channel.id,
      type: 'channel',
      label: channel.name,
      metadata: { channelData: channel },
    };

    this.treeService.addNode(serverId, channelNode);
    this.logger.log(
      LoggerType.SERVICE_NAVIGATION,
      'Added channel:',
      channel.id,
      'to server:',
      serverId,
    );

    console.log(this.treeService.nodes());
  }

  removeChannel(channelId: string): void {
    const wasActive = this.stateService.channelId() === channelId;
    const serverId = this.stateService.serverId();

    this.treeService.removeNode(channelId);

    if (wasActive && serverId) {
      this.handleChannelDeletion(serverId, channelId);
    }

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Removed channel:', channelId);
  }

  private handleServerDeletion(deletedServerId: string): void {
    const servers = this.treeService.getChildren('servers');

    if (servers.length === 0) {
      // Fallback to DMs
      this.stateService.navigate('direct-messages');
    } else {
      // Navigate to first available server
      const firstServer = servers[0];
      const channels = this.treeService.getChildren(firstServer.id);
      const targetId = channels.length > 0 ? channels[0].id : firstServer.id;
      this.stateService.navigate(targetId);
    }
  }

  private handleChannelDeletion(serverId: string, deletedChannelId: string): void {
    const channels = this.treeService.getChildren(serverId);

    if (channels.length === 0) {
      // Navigate to server (maybe a server overview)
      this.stateService.navigate(serverId);
    } else {
      // Navigate to first available channel
      this.stateService.navigate(channels[0].id);
    }
  }
}
