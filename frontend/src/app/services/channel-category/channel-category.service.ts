import { effect, inject, Injectable, signal } from '@angular/core';
import { PrivateApiService } from '../api/private-api.service';
import { ServerService } from '../server/server.service';
import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  WSEventType,
} from '@common/types';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelCategoryService {
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
  private wsService = inject(SocketService);

  readonly channelCategories = signal<ChannelCategory[]>([]);

  constructor() {
    this.initWebSocket();

    //Load categories
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
        console.log(categories);
      },
      error: (err) => console.error('Failed to load server structure', err),
    });
  }

  getCategoryName(categoryId: string) {
    return this.channelCategories().find(
      (category) => category.id === categoryId
    )?.name;
  }

  getCategoryById(id: string): ChannelCategory | undefined {
    return this.channelCategories().find((category) => category.id === id);
  }

  private initWebSocket(): void {
    //Listeners for category creation, edits and deletes
    this.wsService
      .on<ChannelCategory>(WSEventType.CATEGORY_CREATE)
      .subscribe((category) => {
        if (category.serverId === this.serverService.currentServer()) {
          this.channelCategories.update((current) => [...current, category]);
        }
      });

    //Deletes - if a category gets deleted, the server structure needs to be reloaded
    this.wsService
      .on<ChannelCategory>(WSEventType.CATEGORY_DELETE)
      .subscribe((category) => {
        if (category.serverId === this.serverService.currentServer()) {
          this.channelCategories.update((current) =>
            current.filter((c) => c.id !== category.id)
          );
        }
      });

    //Edits
    this.wsService
      .on<ChannelCategory>(WSEventType.CATEGORY_UPDATE)
      .subscribe((category) => {
        if (category.serverId === this.serverService.currentServer()) {
          this.channelCategories.update((currentCategories) =>
            currentCategories.map((c) =>
              c.id === category.id ? { ...c, ...category } : c
            )
          );
        }
      });
  }

  public createCategory(serverId: string, categoryName: string) {
    const newCategoryData: ChannelCategoryCreate = {
      name: categoryName,
    };

    this.apiService.createCategory(serverId, newCategoryData).subscribe({
      next: (category) => {
        console.log('Successfuly category creation');
      },
      error: (err) => {
        console.error('Failed to create categpry:', err);
      },
    });
  }

  public deleteCategory(categoryId: string) {
    this.apiService.deleteCategory(categoryId).subscribe({
      next: () => {
        console.log('Successful category deletion');
      },
      error: (err) => {
        console.error('Unsuccessful edit', err);
      },
    });
  }

  public editCategory(
    categoryId: string,
    categoryUpdate: ChannelCategoryUpdate
  ) {
    this.apiService.editCategory(categoryId, categoryUpdate).subscribe({
      next: () => {
        console.log('Successful category edit');
      },
      error: (err) => {
        console.error('Unsuccesful category edit', err);
      },
    });
  }
}
