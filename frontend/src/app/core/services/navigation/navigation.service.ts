import { computed, Injectable, signal } from '@angular/core';
import { NavigationNode, NavigationView, Server } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  readonly root = signal<NavigationNode>({
    id: 'root',
    children: [
      {
        id: 'servers',
        children: []
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
    activeChildId: 'servers', //Default
  });

  readonly activePath = computed(() => {
    const path: NavigationNode[] = [];
    let current: NavigationNode = this.root();
    while (current.activeChildId) {
      const child = current.children!.find(
        (c) => c.id === current!.activeChildId
      );
      if (!child) break;
      path.push(child);
      current = child;
    }
    return path;
  });

  readonly currentServerId = signal<string | null>(null);
  readonly currentChannelid = signal<string | null>(null);

  public isActive = (id: string) =>
    computed(() => {
      return this.activePath().some((n) => n.id === id);
    });

  navigate(childId: string) {
    const { node, parent } = this.findNodeWithParent(this.root(), childId);

    if (!node || !parent) {
      throw new Error(`Node ${childId} not found or has no parent`);
    }

    parent.activeChildId = childId;
    this.root.update((r) => ({ ...r }));
    console.log(
      'Active path: ',
      this.activePath().map((n) => n.id)
    );
  }

  private findNodeWithParent(
    current: NavigationNode,
    targetId: string,
    parent: NavigationNode | null = null
  ): { node: NavigationNode | null; parent: NavigationNode | null } {
    if (current.id === targetId) {
      return { node: current, parent };
    }
    for (const child of current.children ?? []) {
      const found = this.findNodeWithParent(child, targetId, current);
      if (found.node) return found;
    }
    return { node: null, parent: null };
  }

  private findNode(current: NavigationNode, targetId: string): NavigationNode | null {
    if (current.id === targetId) return current;
    for (const child of current.children ?? []) {
      const found = this.findNode(child, targetId);
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
      return { ...root };
    });
  }

  setChildren(parentId: string, children: NavigationNode[]) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent node ${parentId} not found`);
      parent.children = [...children];
      return { ...root };
    });
  }

  deleteChild(parentId: string, childId: string) {
    this.root.update((root) => {
      const parent = this.findNode(root, parentId);
      if (!parent) throw new Error(`Parent node ${parentId} not found`);
      parent.children = (parent.children ?? []).filter((child) => child.id !== childId);
      return { ...root };
    })
  }
}
