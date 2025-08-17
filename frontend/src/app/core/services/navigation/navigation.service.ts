import { computed, inject, Injectable, signal } from '@angular/core';
import { LoggerType, NavigationNode, NavigationView, Server } from '@common/types';
import { LoggerService } from '../logger/logger.service';

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
          },
        ],
        activeChildId: 'friends', //Default
      },
    ],
    activeChildId: 'direct-messages', //Default
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

    const fullPath = this.getFullPath(path);

    this.root.update((root) => {
      let node = root;
      for (const step of fullPath) {
        node.activeChildId = step.id;
        console.log(node);
        const child = node.children?.find((c) => c.id === step.id);
        if (child) node = child;
      }
      return { ...root };
    });

    const serverNode = fullPath.find((n) => this.getChildren('servers').some((s) => s.id === n.id));
    const lastNode = fullPath[fullPath.length - 1];
    //const channelNode = path.length > 1 ? path[path.length - 1] : null;

    // if (serverNode) {
    //   this.currentServerId.set(serverNode.id);
    //   // this.currentChannelId.set(
    //   //   channelNode && channelNode.id !== serverNode.id ? channelNode.id : null,
    //   // );
    //   this.currentChannelId.set(serverNode.activeChildId ? serverNode.activeChildId : null);
    // } else {
    //   this.currentServerId.set(null);
    //   this.currentChannelId.set(null);
    // }
    if (serverNode) {
      this.currentServerId.set(serverNode.id);
      this.currentChannelId.set(lastNode.id !== serverNode.id ? lastNode.id : null);
    } else {
      this.currentServerId.set(null);
      this.currentChannelId.set(null);
    }

    this.logger.log(
      LoggerType.SERVICE_NAVIGATION,
      'Navigated to path: ',
      this.activePath().map((n) => n.id),
    );

    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Current server ID:', this.currentServerId());
    this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Current channel ID:', this.currentChannelId());
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

  private getFullPath(pathStart: NavigationNode[]) {
    let fullPath = [...pathStart];
    let current = pathStart[pathStart.length - 1];

    while (current.activeChildId) {
      const child = current.children?.find((c) => c.id === current.activeChildId);
      if (!child) break;
      fullPath.push(child);
      current = child;
    }

    return fullPath;
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
          //Pick closest neighbour
          const neighbourIndex = Math.min(childIndex, parent.children.length - 1);
          const neighbour = parent.children[neighbourIndex];
          if (neighbour) {
            this.currentServerId.set(neighbour.id);
            this.navigate(neighbour.id);
          }
        }
      } else if (this.currentChannelId() === childId && childIndex >= 0) {
        if ((parent.children?.length ?? 0) > 0) {
          const neighbourIndex = Math.min(childIndex, parent.children.length - 1);
          const neighbour = parent.children[neighbourIndex];
          if (neighbour) {
            if (parent.id === this.currentChannelId()) {
              this.currentChannelId.set(neighbour.id);
            }
            this.navigate(neighbour.id);
          }
        } else {
          this.navigate(parent.id);
        }
      }

      this.logger.log(LoggerType.SERVICE_NAVIGATION, 'Deleted child', this.root());
      return { ...root };
    });
  }
}
