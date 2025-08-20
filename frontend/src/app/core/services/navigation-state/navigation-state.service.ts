import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { NavigationState } from '@common/types';
import { NavigationTreeService } from '../navigation-tree/navigation-tree.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationStateService {
  private treeService = inject(NavigationTreeService);

  readonly state = signal<NavigationState>({
    activeNodeId: 'online',
    serverId: null,
    channelId: null,
    dmId: null,
  });

  readonly activeNodeId = computed(() => this.state().activeNodeId);
  readonly serverId = computed(() => this.state().serverId);
  readonly channelId = computed(() => this.state().channelId);
  readonly dmId = computed(() => this.state().dmId);

  constructor() {
    effect(() => {
      const activeId = this.activeNodeId();
      this.updateContext(activeId);
    });
  }

  private updateContext(activeNodeId: string): void {
    const path = this.treeService.findPath(activeNodeId);
    const nodes = path.map((id) => this.treeService.getNode(id)).filter(Boolean);

    const serverNode = nodes.find((node) => node!.type === 'server');
    const channelNode = nodes.find((node) => node!.type === 'channel');
    const dmNode = nodes.find((node) => node!.type === 'dm_channel');

    this.state.update((state) => ({
      ...state,
      activeNodeId,
      serverId: serverNode?.id ?? null,
      channelId: channelNode?.id ?? null,
      dmId: dmNode?.id ?? null,
    }));
  }

  navigate(nodeId: string) {
    const node = this.treeService.getNode(nodeId);
    if (!node) {
      throw new Error(`Navigation target ${nodeId} not found`);
    }

    const finalNode = this.findDeepestActiveChild(nodeId);

    this.state.update((state) => ({
      ...state,
      activeNodeId: finalNode,
    }));
  }

  navigateExact(nodeId: string) {
    const node = this.treeService.getNode(nodeId);
    if (!node) {
      throw new Error(`Navigation target ${nodeId} not found`);
    }

    this.state.update((state) => ({
      ...state,
      activeNodeId: nodeId,
    }));
  }

  private findDeepestActiveChild(nodeId: string): string {
    let currentId = nodeId;
    let depth = 0;
    const maxDepth = 10;

    while (depth < maxDepth) {
      const activeChild = this.treeService.getActiveChild(currentId);
      if (!activeChild) break;

      currentId = activeChild.id;
      depth++;
    }

    return currentId;
  }

  isActive(nodeId: string): boolean {
    const path = this.treeService.findPath(this.activeNodeId());
    const finalNode = this.findDeepestActiveChild(nodeId);
    const implicitPath = this.treeService.findPath(finalNode);

    return path.includes(nodeId) || implicitPath.includes(nodeId);
  }

  getActivePath() {
    return this.treeService.findPath(this.activeNodeId());
  }
}
