import { computed, Injectable, signal } from '@angular/core';
import { NavigationNode } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class NavigationTreeService {
  readonly nodes = signal<Map<string, NavigationNode>>(new Map());
  readonly rootNode = computed(() => this.nodes().get('root'));

  constructor() {
    this.initialiseDefaultTree();
  }

  private initialiseDefaultTree() {
    const defaultNodes = new Map<string, NavigationNode>([
      [
        'root',
        {
          id: 'root',
          type: 'root',
          activeChildId: 'direct-messages',
          children: [
            { id: 'servers', type: 'page', label: 'Servers' },
            { id: 'direct-messages', type: 'page', label: 'Direct Messages' },
          ],
        },
      ],
      [
        'servers',
        {
          id: 'servers',
          type: 'page',
          label: 'Servers',
          children: [],
        },
      ],
      [
        'direct-messages',
        {
          id: 'direct-messages',
          type: 'page',
          label: 'Direct Messages',
          activeChildId: 'friends',
          children: [
            { id: 'friends', type: 'dm_section', label: 'Friends' },
            { id: 'direct-message-channels', type: 'dm_section', label: 'Direct Message Channels' },
          ],
        },
      ],
      [
        'friends',
        {
          id: 'friends',
          type: 'dm_section',
          label: 'Friends',
          activeChildId: 'online',
          children: [
            { id: 'online', type: 'friend_section', label: 'Online' },
            { id: 'all', type: 'friend_section', label: 'All' },
            { id: 'pending', type: 'friend_section', label: 'Pending' },
            { id: 'blocked', type: 'friend_section', label: 'Blocked' },
            { id: 'add-friend', type: 'friend_section', label: 'Add Friend' },
          ],
        },
      ],
      [
        'direct-message-channels',
        {
          id: 'direct-message-channels',
          type: 'dm_section',
          label: 'Direct Message Channels',
          children: [],
        },
      ],
      ['online', { id: 'online', type: 'friend_section', label: 'Online' }],
      ['all', { id: 'all', type: 'friend_section', label: 'All' }],
      ['incoming', { id: 'incoming', type: 'friend_section', label: 'Incoming' }],
      ['outgoing', { id: 'outgoing', type: 'friend_section', label: 'Outgoing' }],
      ['add-friend', { id: 'add-friend', type: 'friend_section', label: 'Add Friend' }],
    ]);

    const flattenNodes = (node: NavigationNode): void => {
      defaultNodes.set(node.id, {
        ...node,
        children: node.children?.map((child) => ({ ...child })),
      });
      node.children?.forEach((child) => flattenNodes(child));
    };

    defaultNodes.get('root')!.children?.forEach((child) => flattenNodes(child));
    this.nodes.set(defaultNodes);

    console.log(this.nodes());
  }

  getNode(id: string) {
    return this.nodes().get(id);
  }

  getChildren(parentId: string) {
    const parent = this.getNode(parentId);
    return parent?.children || [];
  }

  addNode(parentId: string, node: NavigationNode): void {
    this.nodes.update((nodes) => {
      const newNodes = new Map(nodes);
      const parent = newNodes.get(parentId);

      if (!parent) {
        throw new Error(`Parent node ${parentId} not found`);
      }

      // Add to parent's children
      parent.children = [...(parent.children || []), node];

      // Add node to flat map
      newNodes.set(node.id, node);

      // Recursively add child nodes
      const addChildNodes = (n: NavigationNode): void => {
        n.children?.forEach((child) => {
          newNodes.set(child.id, child);
          addChildNodes(child);
        });
      };
      addChildNodes(node);

      return newNodes;
    });
  }

  removeNode(nodeId: string): void {
    this.nodes.update((nodes) => {
      const newNodes = new Map(nodes);
      const nodeToRemove = newNodes.get(nodeId);

      if (!nodeToRemove) return newNodes;

      // Remove from all parents
      newNodes.forEach((node) => {
        if (node.children) {
          node.children = node.children.filter((child) => child.id !== nodeId);
        }
      });

      // Recursively remove child nodes
      const removeChildNodes = (node: NavigationNode): void => {
        node.children?.forEach((child) => {
          newNodes.delete(child.id);
          removeChildNodes(child);
        });
      };

      removeChildNodes(nodeToRemove);
      newNodes.delete(nodeId);

      return newNodes;
    });
  }

  updateActiveChild(parentId: string, childId: string) {
    this.nodes.update((nodes) => {
      const newNodes = new Map(nodes);
      const parent = newNodes.get(parentId);

      if (!parent) throw new Error(`Parent node ${parentId} not found`);

      const childExists = parent.children?.some((child) => child.id === childId);
      if (!childExists) throw new Error(`Child ${childId} not found in parent ${parentId}`);

      parent.activeChildId = childId;
      return newNodes;
    });
  }

  getActiveChild(parentId: string): NavigationNode | undefined {
    const parent = this.getNode(parentId);
    if (!parent?.activeChildId || !parent.children) return undefined;

    return parent.children.find((child) => child.id === parent.activeChildId);
  }

  updateNode(nodeId: string, updates: Partial<NavigationNode>): void {
    this.nodes.update((nodes) => {
      const newNodes = new Map(nodes);
      const existing = newNodes.get(nodeId);

      if (existing) {
        newNodes.set(nodeId, { ...existing, ...updates });
      }

      return newNodes;
    });
  }

  findPath(targetId: string, fromId: string = 'root'): string[] {
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[]): string[] | null => {
      if (visited.has(currentId)) return null;
      visited.add(currentId);

      const currentPath = [...path, currentId];

      if (currentId === targetId) return currentPath;

      const node = this.getNode(currentId);
      if (!node?.children) return null;

      for (const child of node.children) {
        const result = dfs(child.id, currentPath);
        if (result) return result;
      }

      return null;
    };

    return dfs(fromId, []) || [];
  }
}
