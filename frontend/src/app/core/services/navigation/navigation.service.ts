import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  Channel,
  LoggerType,
  NavigationNode,
  NavigationState,
  NavigationView,
  Server,
} from '@common/types';
import { LoggerService } from '../logger/logger.service';
import { NavigationTreeService } from '../navigation-tree/navigation-tree.service';
import { NavigationStateService } from '../navigation-state/navigation-state.service';
import { NavigationActionsService } from '../navigation-actions/navigation-actions.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  //private logger = inject(LoggerService);

  // readonly root = signal<NavigationNode>({
  //   id: 'root',
  //   children: [
  //     {
  //       id: 'servers',
  //     },
  //     {
  //       id: 'direct-messages',
  //       children: [
  //         {
  //           id: 'friends',
  //           children: [
  //             { id: 'all' },
  //             { id: 'online' },
  //             { id: 'incoming' },
  //             { id: 'outgoing' },
  //             { id: 'add-friend' },
  //           ],
  //           activeChildId: 'online',
  //         },
  //         {
  //           id: 'direct-message-chat',
  //           children: []     // DMs
  //         },
  //       ],
  //       activeChildId: 'friends', //Default
  //     },
  //   ],
  //   activeChildId: 'direct-messages', //Default
  // });

  // constructor() {
  //   this.logger.init(LoggerType.SERVICE_NAVIGATION);
  // }

  // readonly activePath = computed(() => {
  //   const path: NavigationNode[] = [];
  //   let current: NavigationNode = this.root();
  //   while (current.activeChildId) {
  //     const child = current.children!.find((c) => c.id === current!.activeChildId);
  //     if (!child) break;
  //     path.push(child);
  //     current = child;
  //   }
  //   return path;
  // });

  // readonly currentServerId = signal<string | null>(null);
  // readonly currentChannelId = signal<string | null>(null);

  // public isActive = (id: string) =>
  //   computed(() => {
  //     return this.activePath().some((n) => n.id === id);
  //   });

  // private getDefaultChannel(server: NavigationNode): NavigationNode | null {
  //   if (!server.children || server.children.length === 0) return null;
  //   return server.children[0];
  // }

  // navigate(targetId: string) {
  //   const path = this.findPath(this.root(), targetId);

  //   if (!path) throw new Error(`Node ${targetId} not found or has no parent`);

  //   let fullPath = this.getFullPath(path);

  //   // if (serverNode && !this.currentChannelId()) {
  //   //   const defaultChannel = this.getDefaultChannel(serverNode);
  //   //   if (defaultChannel) {
  //   //     if (!fullPath.includes(defaultChannel)) {
  //   //       fullPath = [...fullPath, defaultChannel];
  //   //     }
  //   //   }
  //   // }

  //   // console.log(fullPath);

  //   this.root.update((root) => {
  //     let node = root;
  //     for (const step of fullPath) {
  //       node.activeChildId = step.id;
  //       const child = node.children?.find((c) => c.id === step.id);
  //       if (child) node = child;
  //     }
  //     return { ...root };
  //   });

  //   const serverNode = fullPath.find((n) => this.getChildren('servers').some((s) => s.id === n.id));
  //   const channelNode = fullPath[fullPath.length - 1];

  //   if (serverNode) {
  //     this.currentServerId.set(serverNode.id);
  //     this.currentChannelId.set(channelNode.id !== serverNode.id ? channelNode.id : null);
  //   } else {
  //     this.currentServerId.set(null);
  //     this.currentChannelId.set(null);
  //   }

  //   this.logger.log(
  //     LoggerType.SERVICE_NAVIGATION,
  //     'Navigated to path: ',
  //     this.activePath().map((n) => n.id),
  //   );

  //   this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Current server ID:', this.currentServerId());
  //   this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Current channel ID:', this.currentChannelId());
  //   console.log(this.root());
  // }

  // private findNode(current: NavigationNode, targetId: string): NavigationNode | null {
  //   if (current.id === targetId) return current;
  //   for (const child of current.children ?? []) {
  //     const found = this.findNode(child, targetId);
  //     if (found) return found;
  //   }
  //   return null;
  // }

  // private findPath(
  //   current: NavigationNode,
  //   targetId: string,
  //   path: NavigationNode[] = [],
  // ): NavigationNode[] | null {
  //   path.push(current);

  //   if (current.id === targetId) return [...path];

  //   for (const child of current.children ?? []) {
  //     const found = this.findPath(child, targetId, [...path]);
  //     if (found) return found;
  //   }

  //   return null;
  // }

  // private getFullPath(pathStart: NavigationNode[]) {
  //   let fullPath = [...pathStart];
  //   let current = pathStart[pathStart.length - 1];

  //   while (current.activeChildId) {
  //     const child = current.children?.find((c) => c.id === current.activeChildId);
  //     if (!child) break;
  //     fullPath.push(child);
  //     current = child;
  //   }

  //   return fullPath;
  // }

  // getChildren(parentId: string): NavigationNode[] {
  //   const parent = this.findNode(this.root(), parentId);
  //   return parent?.children ?? [];
  // }

  // addChildren(parentId: string, children: NavigationNode[]) {
  //   this.root.update((root) => {
  //     const parent = this.findNode(root, parentId);
  //     if (!parent) throw new Error(`Parent node ${parentId} not found`);
  //     parent.children = [...(parent.children ?? []), ...children];

  //     this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Added children', this.root());
  //     return { ...root };
  //   });
  // }

  // setChildren(parentId: string, children: NavigationNode[]) {
  //   this.root.update((root) => {
  //     const parent = this.findNode(root, parentId);
  //     if (!parent) throw new Error(`Parent node ${parentId} not found`);
  //     parent.children = [...children];

  //     if (parent.id === 'servers' && (parent.children?.length ?? 0) === 0) {
  //       this.currentServerId.set(null);
  //       this.currentChannelId.set(null);
  //       root.activeChildId = 'direct-messages';
  //     }

  //     this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Set children', this.root());
  //     return { ...root };
  //   });
  // }

  // deleteChild(parentId: string, childId: string) {
  //   this.root.update((root) => {
  //     const parent = this.findNode(root, parentId);
  //     if (!parent) throw new Error(`Parent node ${parentId} not found`);

  //     const childIndex = parent.children?.findIndex((c) => c.id === childId) ?? -1;

  //     parent.children = (parent.children ?? []).filter((child) => child.id !== childId);

  //     if (parent.id === 'servers') {
  //       if ((parent.children?.length ?? 0) === 0) {
  //         //Fallback to DMs
  //         this.currentServerId.set(null);
  //         this.currentChannelId.set(null);
  //         root.activeChildId = 'direct-messages';
  //       } else if (this.currentServerId() === childId && childIndex >= 0) {
  //         //Pick closest neighbour
  //         const neighbourIndex = Math.min(childIndex, parent.children.length - 1);
  //         const neighbour = parent.children[neighbourIndex];
  //         if (neighbour) {
  //           this.currentServerId.set(neighbour.id);
  //           this.navigate(neighbour.id);
  //         }
  //       }
  //     } else if (this.currentChannelId() === childId && childIndex >= 0) {
  //       if ((parent.children?.length ?? 0) > 0) {
  //         const neighbourIndex = Math.min(childIndex, parent.children.length - 1);
  //         const neighbour = parent.children[neighbourIndex];
  //         if (neighbour) {
  //           if (parent.id === this.currentChannelId()) {
  //             this.currentChannelId.set(neighbour.id);
  //           }
  //           this.navigate(neighbour.id);
  //         }
  //       } else {
  //         this.navigate(parent.id);
  //       }
  //     }

  //     // parent.children = (parent.children ?? []).filter((child) => child.id !== childId);

  //     // if (parent.id === 'servers') {
  //     //   this.handleServerDeletion(parent, childId, root);
  //     // } else {
  //     //   this.deleteChannel(parent, childId);
  //     // }

  //     this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Deleted child', this.root());
  //     return { ...root };
  //   });
  // }

  // private removeChild(parent: NavigationNode, childId: string) {
  //   return (parent.children ?? []).filter((c) => c.id !== childId);
  // }

  // private getChildIndex(parent: NavigationNode, childId: string) {
  //   return parent.children?.findIndex((c) => c.id === childId) ?? -1;
  // }

  // private pickNeighbour(
  //   children: NavigationNode[],
  //   deletedIndex: number,
  // ): NavigationNode | undefined {
  //   if (children.length === 0) return undefined;
  //   return children[Math.min(deletedIndex, children.length - 1)];
  // }

  // private handleServerDeletion(
  //   parent: NavigationNode,
  //   deletedServerId: string,
  //   root: NavigationNode,
  // ) {
  //   const childIndex = this.getChildIndex(parent, deletedServerId);

  //   if (parent.children?.length ?? 0 === 0) {
  //     //Fallback to DMs
  //     this.currentServerId.set(null);
  //     this.currentChannelId.set(null);
  //     root.activeChildId = 'direct-messages';
  //     return;
  //   }

  //   if (this.currentServerId() === deletedServerId && childIndex >= 0) {
  //     const neighbour = this.pickNeighbour(parent.children!, childIndex);
  //     if (neighbour) {
  //       this.currentServerId.set(neighbour.id);
  //       this.navigate(neighbour.id);
  //     }
  //   }
  // }

  // private deleteChannel(parent: NavigationNode, deletedChannelId: string) {
  //   const childIndex = this.getChildIndex(parent, deletedChannelId);

  //   if (this.currentChannelId() !== deletedChannelId || childIndex < 0) return;

  //   const neighbour = this.pickNeighbour(parent.children!, childIndex);

  //   if (neighbour) {
  //     if (parent.id === this.currentChannelId()) this.currentChannelId.set(neighbour.id);
  //     this.navigate(neighbour.id);
  //   } else {
  //     this.navigate(parent.id);
  //   }
  // }

  //Attempt 2:

  // private treeService = inject(NavigationTreeService);
  // private stateService = inject(NavigationStateService);
  // private actionsService = inject(NavigationActionsService);

  // readonly rootNode = this.treeService.rootNode;
  // readonly activeNodeId = this.stateService.activeNodeId;
  // readonly serverId = this.stateService.serverId;
  // readonly channelId = this.stateService.channelId;
  // readonly dmId = this.stateService.dmId;
  // readonly activePath = computed(() => this.stateService.getActivePath());

  // // Tree operations
  // getNode = (id: string) => this.treeService.getNode(id);
  // getChildren = (parentId: string) => this.treeService.getChildren(parentId);

  // // Navigation
  // navigate = (nodeId: string) => this.stateService.navigate(nodeId);
  // isActive = (nodeId: string) => this.stateService.isActive(nodeId);

  // // Server/Channel management
  // addServer = (server: { id: string; name: string; channels?: any[] }) =>
  //   this.actionsService.addServer(server);

  // removeServer = (serverId: string) => this.actionsService.removeServer(serverId);

  // addChannel = (serverId: string, channel: { id: string; name: string }) =>
  //   this.actionsService.addChannel(serverId, channel);

  // removeChannel = (channelId: string) => this.actionsService.removeChannel(channelId);

  // // Utility methods
  // findServers = () => this.getChildren('servers');
  // findChannels = (serverId: string) => this.getChildren(serverId);

  //Attempt 3:
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

  readonly activePathIds = computed(() => {
    return this.activePath().map((n) => n.id);
  });

  //readonly state = computed<NavigationState>(() => this.deriveState(this.activePath()));
  readonly activeServerId = signal<string | null>(null);
  readonly activeChannelId = signal<string | null>(null);
  readonly activeDMId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.deriveState(this.activePath());
    });
  }

  isActive = (nodeId: string) =>
    this.activePath()
      .map((n) => n.id)
      .includes(nodeId);

  navigate(targetId: string) {
    const path = this.findPath(this.root(), targetId);
    if (!path) throw new Error(`Node ${targetId} not found`);

    this.root.update((root) => {
      let node = root;
      for (const step of path) {
        node.activeChildId = step.id;
        node = node.children?.find((c) => c.id === step.id) ?? node;
      }
      return { ...root };
    });

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Navigated', this.activePath());
    console.log(this.root());
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

      parent.children = Array.from(existing.values()); //[...(parent.children ?? []), ...children];
      return { ...root };
    });
  }

  private deleteChild(parentId: string, childId: string) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent ${parentId} not found`);

      //const index = parent.children?.findIndex((c) => c.id === childId) ?? -1;
      parent.children = parent.children?.filter((c) => c.id !== childId);

      // // neighbour fallback - should be handled elsewhere
      // if (this.state().activeNodeId === childId) {
      //   const neighbour = this.pickNeighbour(parent.children ?? [], index);
      //   this.navigate(neighbour ? neighbour.id : parent.id);
      // }
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

    //this.treeService.addNode('servers', serverNode);
    this.addChildren('servers', serverNodes);

    //this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Added server:', server.id);
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
    const channelNodes: NavigationNode[] = channels.map((channel) => {
      return {
        id: channel.id,
        type: 'channel',
        label: channel.name,
      };
    });

    //this.treeService.addNode(serverId, channelNode);
    this.addChildren(serverId, channelNodes);

    // this.logger.log(
    //   LoggerType.SERVICE_NAVIGATION,
    //   'Added channel:',
    //   channel.id,
    //   'to server:',
    //   serverId,
    // );

    //console.log(this.treeService.nodes());
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
