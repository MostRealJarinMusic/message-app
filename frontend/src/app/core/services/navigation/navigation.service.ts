import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Channel, LoggerType, NavigationNode, Server } from '@common/types';
import { LoggerService } from '../logger/logger.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private logger = inject(LoggerService);

  readonly root = signal<NavigationNode>({
    id: 'root',
    type: 'root',
    activeChildId: 'direct_messages',
    children: [
      { id: 'servers', type: 'page', children: [] },
      {
        id: 'direct_messages',
        type: 'page',
        activeChildId: 'friends',
        children: [
          {
            id: 'friends',
            type: 'dm_section',
            activeChildId: 'online',
            children: [
              { id: 'all', type: 'friend_section' },
              { id: 'online', type: 'friend_section' },
              { id: 'incoming', type: 'friend_section' },
              { id: 'outgoing', type: 'friend_section' },
              { id: 'add-friend', type: 'friend_section' },
            ],
          },
          { id: 'direct_message_channels', type: 'dm_section', children: [] },
        ],
      },
    ],
  });

  readonly activePath = computed(() => {
    const path: NavigationNode[] = [];
    let current = this.root();
    while (current.activeChildId) {
      const child = current.children?.find((c) => c.id === current.activeChildId);
      if (!child) break;
      path.push(child);
      current = child;
    }
    return path;
  });

  //DEBUG
  readonly activePathIds = computed(() => {
    return this.activePath().map((n) => n.id);
  });

  readonly activeServerId = signal<string | null>(null);
  readonly activeChannelId = signal<string | null>(null);
  readonly activeDMId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.deriveState(this.activePath());
    });

    // effect(() => {
    //   console.log('Active Channel ID:', this.activeChannelId());
    // });
  }

  isActive = (nodeId: string) =>
    this.activePath()
      .map((n) => n.id)
      .includes(nodeId);

  navigate(targetId: string) {
    const path = this.findPath(this.root(), targetId);
    if (!path) throw new Error(`Node ${targetId} not found`);

    path.filter((n) => n.id !== 'root');
    // console.log('Path:', path);

    this.root.update((root) => {
      let node = root;
      for (const step of path) {
        node.activeChildId = step.id;
        // console.log('Node', node);
        node = node.children?.find((c) => c.id === step.id) ?? node;
      }
      return { ...root };
    });

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Navigated', this.activePath());
    //console.log(this.root());
  }

  private addChildren(parentId: string, children: NavigationNode[]) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent ${parentId} not found`);

      const existing = new Map<string, NavigationNode>(
        (parent.children ?? []).map((c) => [c.id, c]),
      );

      for (const newChild of children) {
        if (!existing.has(newChild.id)) existing.set(newChild.id, newChild);
      }

      parent.children = Array.from(existing.values());
      return { ...root };
    });
  }

  private deleteChild(parentId: string, childId: string) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent ${parentId} not found`);

      parent.children = parent.children?.filter((c) => c.id !== childId);

      return { ...root };
    });
  }

  private getChildren(parentId: string): NavigationNode[] {
    const parent = this.findNode(this.root(), parentId);
    return parent?.children ?? [];
  }

  private getChildIndex(parentId: string, childId: string) {
    const parent = this.findNode(this.root(), parentId);
    if (!parent) throw new Error(`Parent ${parentId} not found`);

    return parent.children?.findIndex((c) => c.id === childId) ?? -1;
  }

  private findNode(root: NavigationNode, id: string): NavigationNode | null {
    if (root.id === id) return root;
    for (const child of root.children ?? []) {
      const found = this.findNode(child, id);
      if (found) return found;
    }
    return null;
  }

  private findPath(
    root: NavigationNode,
    targetId: string,
    path: NavigationNode[] = [],
  ): NavigationNode[] | null {
    if (root.id === targetId) return [...path, root];
    for (const child of root.children ?? []) {
      const found = this.findPath(child, targetId, [...path, root]);
      if (found) return found;
    }
    return null;
  }

  private pickNeighbour(children: NavigationNode[], deletedIndex: number) {
    if (!children.length) return undefined;
    return children[Math.min(deletedIndex, children.length - 1)];
  }

  private clearActiveId(nodeId: string) {
    this.root.update((root) => {
      const node = this.findNode(root, nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      node.activeChildId = undefined;

      return { ...root };
    });
  }

  private deriveState(activePath: NavigationNode[]) {
    let serverId: string | null = null;
    let channelId: string | null = null;
    let dmId: string | null = null;

    for (const node of activePath) {
      if (node.type === 'server') serverId = node.id;
      if (node.type === 'channel') channelId = node.id;
      if (node.type === 'dm_channel') dmId = node.id;
    }

    this.activeServerId.set(serverId);
    this.activeChannelId.set(channelId);
    this.activeDMId.set(dmId);
  }

  addServers(servers: Server[]): void {
    const serverNodes: NavigationNode[] = servers.map((server) => {
      return {
        id: server.id,
        type: 'server',
        label: server.name,
      };
    });

    this.addChildren('servers', serverNodes);
  }

  removeServer(serverId: string): void {
    const wasActive = this.activeServerId() === serverId;
    const serverIndex = this.getChildIndex('servers', serverId);

    this.deleteChild('servers', serverId);

    if (wasActive) {
      this.handleServerDeletion(serverIndex);
    }

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Removed server:', serverId);
  }

  addChannels(serverId: string, channels: Channel[]): void {
    if (channels.length <= 0) return;

    const channelNodes: NavigationNode[] = channels.map((channel) => {
      return {
        id: channel.id,
        type: 'channel',
        label: channel.name,
      };
    });

    this.addChildren(serverId, channelNodes);

    // Attempt to navigate to channel if no channel selected for the current server
    if (serverId !== this.activeServerId()) return;
    if (this.activeChannelId()) return;

    this.navigate(channelNodes[0].id);
  }

  addDMChannels(channels: Channel[]): void {
    if (channels.length <= 0) return;
    const channelNodes: NavigationNode[] = channels.map((channel) => {
      return {
        id: channel.id,
        type: 'dm_channel',
        label: channel.name,
      };
    });

    this.addChildren('direct_message_channels', channelNodes);
  }

  removeChannel(parentServerId: string, channelId: string): void {
    const wasActive = this.activeChannelId() === channelId;
    const serverId = this.activeServerId();
    const channelIndex = this.getChildIndex(parentServerId, channelId);

    this.deleteChild(parentServerId, channelId);

    if (wasActive && serverId) {
      this.handleChannelDeletion(serverId, channelIndex);
    }

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Removed channel:', channelId);
  }

  private handleServerDeletion(deletedServerIndex: number): void {
    const servers = this.getChildren('servers');

    if (servers.length === 0) {
      this.clearActiveId('servers');
      this.navigate('direct_messages');
      return;
    }

    const neighbour = this.pickNeighbour(servers, deletedServerIndex);
    if (!neighbour) throw new Error(`Unable to choose neighbour server for navigation`);
    this.navigate(neighbour.id);
  }

  private handleChannelDeletion(serverId: string, deletedChannelIndex: number): void {
    const channels = this.getChildren(serverId);

    if (channels.length === 0) {
      this.clearActiveId(serverId);
      this.navigate(serverId);
      return;
    }

    const neighbour = this.pickNeighbour(channels, deletedChannelIndex);
    if (!neighbour) throw new Error(`Unable to choose neighbour server for navigation`);
    this.navigate(neighbour.id);
  }
}
