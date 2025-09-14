import { computed, inject, Injectable, signal } from '@angular/core';
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
    const channel = this.navService.activeChannelId() || this.navService.activeDMId();
    if (!channel) return [];

    const user = this.userService.currentUser();
    if (!user) return [];

    // Remove yourself from the active typers
    return Array.from(this.activeTyperStore().get(channel) ?? []).filter((id) => id !== user.id);
  });

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    this.wsService.on(WSEventType.TYPING_START).subscribe({
      next: (indicator) => {
        this.activeTyperStore.update((store) => {
          if (!store.has(indicator.channelId)) store.set(indicator.channelId, new Set());

          store.get(indicator.channelId)?.add(indicator.userId);
          return store;
        });
      },
      error: (err) => {
        console.log('Failed to indicate typing', err);
      },
    });

    this.wsService.on(WSEventType.TYPING_STOP).subscribe({
      next: (indicator) => {
        this.activeTyperStore.update((store) => {
          const activeTypers = store.get(indicator.channelId);
          if (!activeTypers) return store;

          activeTypers.delete(indicator.userId);
          if (activeTypers.size === 0) store.delete(indicator.channelId);

          return store;
        });
      },
    });
  }

  startTyping(indicator: TypingIndicator) {
    this.wsService.emit(WSEventType.TYPING_START, indicator);
  }

  stopTyping(indicator: TypingIndicator) {
    this.wsService.emit(WSEventType.TYPING_STOP, indicator);
  }
}
