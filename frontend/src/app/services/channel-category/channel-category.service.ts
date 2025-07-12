import { effect, inject, Injectable, signal } from '@angular/core';
import { PrivateApiService } from '../api/private-api.service';
import { ServerService } from '../server/server.service';
import { ChannelCategory } from '@common/types';

@Injectable({
  providedIn: 'root',
})
export class ChannelCategoryService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);

  readonly channelCategories = signal<ChannelCategory[]>([]);

  constructor() {
    effect(() => {
      const currentServer = this.serverService.currentServer();
      if (currentServer) {
        this.loadCategories(currentServer);
      }
    });
  }

  private loadCategories(serverId: string) {
    this.apiService.getServerStructure(serverId).subscribe({
      next: (categories) => {
        this.channelCategories.set(categories);
      },
      error: (err) => console.error('Failed to load server structure', err),
    });
  }

  getCategoryName(categoryId: string) {
    return this.channelCategories().find(
      (category) => category.id === categoryId
    )?.name;
  }
}
