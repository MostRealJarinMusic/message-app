import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { TypingIndicator, WSEventType } from '@common/types';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserService } from 'src/app/features/user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class TypingService {
  private wsService = inject(SocketService);
  private navService = inject(NavigationService);
  private userService = inject(UserService);

  private activeTyperStore = signal(new Map<string, Set<string>>());

  activeChannelTypers = computed(() => {
    const channelId = this.navService.activeChannelId() || this.navService.activeDMId();
    if (!channelId) return [];

    const user = this.userService.currentUser();
    if (!user) return [];

    // Remove yourself from the active typers
    return Array.from(this.activeTyperStore().get(channelId) ?? []).filter((id) => id !== user.id);
  });

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    this.wsService.on(WSEventType.TYPING_START).subscribe({
      next: (indicator) => {
        this.activeTyperStore.update((store) => {
          const newStore = new Map(store);
          const users = new Set(newStore.get(indicator.channelId) || []);

          users.add(indicator.userId);
          newStore.set(indicator.channelId, users);

          return newStore;
        });
      },
      error: (err) => {
        console.log('Failed to indicate typing', err);
      },
    });

    this.wsService.on(WSEventType.TYPING_STOP).subscribe({
      next: (indicator) => {
        this.activeTyperStore.update((store) => {
          const newStore = new Map(store);
          const activeTypers = new Set(newStore.get(indicator.channelId) || []);

          activeTypers.delete(indicator.userId);

          if (activeTypers.size > 0) {
            newStore.set(indicator.channelId, activeTypers);
          } else {
            newStore.delete(indicator.channelId);
          }

          return newStore;
        });
      },
    });
  }

  startTyping(channelId: string) {
    const user = this.userService.currentUser();
    if (!user) return;

    const indicator: TypingIndicator = {
      channelId,
      userId: user.id,
    };

    this.wsService.emit(WSEventType.TYPING_START, indicator);
  }

  stopTyping(channelId: string) {
    const user = this.userService.currentUser();
    if (!user) return;

    const indicator: TypingIndicator = {
      channelId,
      userId: user.id,
    };

    this.wsService.emit(WSEventType.TYPING_STOP, indicator);
  }
}
