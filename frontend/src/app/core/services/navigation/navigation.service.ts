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
}
