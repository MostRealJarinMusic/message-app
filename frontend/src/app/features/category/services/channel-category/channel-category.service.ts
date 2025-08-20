import { effect, inject, Injectable, signal } from '@angular/core';
import {
  ChannelCategory,
  ChannelCategoryCreate,
  ChannelCategoryUpdate,
  LoggerType,
  WSEventType,
} from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { ServerService } from 'src/app/features/server/services/server/server.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelCategoryService {
  private logger = inject(LoggerService);
  private apiService = inject(PrivateApiService);
  private serverService = inject(ServerService);
  private navService = inject(NavigationService);
  private wsService = inject(SocketService);

  readonly channelCategories = signal<ChannelCategory[] | null>(null);

  constructor() {
    this.initWebSocket();

    //Load categories
    effect(() => {
      const currentServer = this.navService.serverId();
      if (currentServer) {
        this.logger.log(LoggerType.SERVICE_CATEGORY, 'Loading channel categories');
        this.channelCategories.set(null);
        this.loadCategories(currentServer);
      } else {
        this.channelCategories.set(null);
      }
    });
  }

  private loadCategories(serverId: string) {
    this.apiService.getServerStructure(serverId).subscribe({
      next: (categories) => {
        this.channelCategories.set(categories);
      },
      error: (err) =>
        this.logger.error(LoggerType.SERVICE_CATEGORY, 'Failed to load server structure', err),
    });
  }

  getCategoryName(categoryId: string) {
    return this.channelCategories()!.find((category) => category.id === categoryId)?.name;
  }

  getCategoryById(id: string): ChannelCategory | undefined {
    return this.channelCategories()!.find((category) => category.id === id);
  }

  private initWebSocket(): void {
    //Listeners for category creation, edits and deletes
    this.wsService.on(WSEventType.CATEGORY_CREATE).subscribe((category) => {
      if (category.serverId === this.navService.serverId()) {
        this.channelCategories.update((current) => [...current!, category]);
      }
    });

    //Deletes - if a category gets deleted, the server structure needs to be reloaded
    this.wsService.on(WSEventType.CATEGORY_DELETE).subscribe((category) => {
      if (category.serverId === this.navService.serverId()) {
        this.channelCategories.update((current) => current!.filter((c) => c.id !== category.id));
      }
    });

    //Edits
    this.wsService.on(WSEventType.CATEGORY_UPDATE).subscribe((category) => {
      if (category.serverId === this.navService.serverId()) {
        this.channelCategories.update((currentCategories) =>
          currentCategories!.map((c) => (c.id === category.id ? { ...c, ...category } : c)),
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
        this.logger.log(LoggerType.SERVICE_CATEGORY, 'Successfully category creation');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CATEGORY, 'Failed to create category:', err);
      },
    });
  }

  public deleteCategory(categoryId: string) {
    this.apiService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_CATEGORY, 'Successful category deletion');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CATEGORY, 'Unsuccessful edit', err);
      },
    });
  }

  public editCategory(categoryId: string, categoryUpdate: ChannelCategoryUpdate) {
    this.apiService.editCategory(categoryId, categoryUpdate).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_CATEGORY, 'Successful category edit');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_CATEGORY, 'Unsuccessful category edit', err);
      },
    });
  }
}
