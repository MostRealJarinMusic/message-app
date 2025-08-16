import { computed, inject, Injectable, signal } from '@angular/core';
import { LoggerType, NavigationNode, NavigationView, Server } from '@common/types';
import { LoggerService } from '../logger/logger.service';
import { channel } from 'diagnostics_channel';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private logger = inject(LoggerService);

  readonly root = signal<NavigationNode>({
    id: 'root',
    children: [
      {
        id: 'servers',
        children: [],
      },
      {
        id: 'direct-messages',
        children: [
          {
            id: 'friends',
            children: [
              { id: 'all' },
              { id: 'online' },
              { id: 'incoming' },
              { id: 'outgoing' },
              { id: 'add-friend' },
            ],
            activeChildId: 'online',
          },
          {
            id: 'direct-message-chat',
            children: [],
          },
        ],
        activeChildId: 'friends', //Default
      },
    ],
    activeChildId: 'servers', //Default
  });

  readonly activePath = computed(() => {
    const path: NavigationNode[] = [];
    let current: NavigationNode = this.root();
    while (current.activeChildId) {
      const child = current.children!.find((c) => c.id === current!.activeChildId);
      if (!child) break;
      path.push(child);
      current = child;
    }
    return path;
  });

  readonly currentServerId = signal<string | null>(null);
  readonly currentChannelId = signal<string | null>(null);

  public isActive = (id: string) =>
    computed(() => {
      return this.activePath().some((n) => n.id === id);
    });

  navigate(targetId: string) {
    const path = this.findPath(this.root(), targetId);

    if (!path) throw new Error(`Node ${targetId} not found or has no parent`);

    this.root.update((root) => {
      let current = root;
      for (let i = 1; i < path.length; i++) {
        const node = path[i];
        current.activeChildId = node.id;
        current = node;
      }
      return { ...root };
    });

    const serverNode = path.find((n) => this.getChildren('servers').some((s) => s.id === n.id));
    const channelNode = path.length > 1 ? path[path.length - 1] : null;

    if (serverNode) {
      this.currentServerId.set(serverNode.id);
      this.currentChannelId.set(
        channelNode && channelNode.id !== serverNode.id ? channelNode.id : null,
      );
    } else {
      this.currentServerId.set(null);
      this.currentChannelId.set(null);
    }

    this.logger.log(
      LoggerType.SERVICE_NAVIGATION,
      'Navigated to path: ',
      this.activePath().map((n) => n.id),
    );
  }

  private findNode(current: NavigationNode, targetId: string): NavigationNode | null {
    if (current.id === targetId) return current;
    for (const child of current.children ?? []) {
      const found = this.findNode(child, targetId);
      if (found) return found;
    }
    return null;
  }

  private findPath(
    current: NavigationNode,
    targetId: string,
    path: NavigationNode[] = [],
  ): NavigationNode[] | null {
    path.push(current);

    if (current.id === targetId) return [...path];

    for (const child of current.children ?? []) {
      const found = this.findPath(child, targetId, [...path]);
      if (found) return found;
    }

    return null;
  }

  getChildren(parentId: string): NavigationNode[] {
    const parent = this.findNode(this.root(), parentId);
    return parent?.children ?? [];
  }

  addChildren(parentId: string, children: NavigationNode[]) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent node ${parentId} not found`);
      parent.children = [...(parent.children ?? []), ...children];

      this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Added children', this.root());
      return { ...root };
    });
  }

  setChildren(parentId: string, children: NavigationNode[]) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent node ${parentId} not found`);
      parent.children = [...children];

      if (parent.id === 'servers' && (parent.children?.length ?? 0) === 0) {
        this.currentServerId.set(null);
        this.currentChannelId.set(null);
        root.activeChildId = 'direct-messages';
      }

      this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Set children', this.root());
      return { ...root };
    });
  }

  deleteChild(parentId: string, childId: string) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent node ${parentId} not found`);

      const childIndex = parent.children?.findIndex((c) => c.id === childId) ?? -1;

      parent.children = (parent.children ?? []).filter((child) => child.id !== childId);

      if (parent.id === 'servers') {
        if ((parent.children?.length ?? 0) === 0) {
          //Fallback to DMs
          this.currentServerId.set(null);
          this.currentChannelId.set(null);
          root.activeChildId = 'direct-messages';
        } else if (this.currentServerId() === childId && childIndex >= 0) {
          const neighbourIndex = Math.min(childIndex, parent.children.length - 1);
          const neighbour = parent.children[neighbourIndex];
          if (neighbour) {
            this.currentServerId.set(neighbour.id);
            this.navigate(neighbour.id);
          }
        }
      }

      this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Deleted child', this.root());
      return { ...root };
    });
  }
}
