import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../../../../core/services/socket/socket.service';
import {
  LoggerType,
  Message,
  CreateMessagePayload,
  UpdateMessagePayload,
  WSEventType,
} from '@common/types';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private wsService = inject(SocketService);
  private navService = inject(NavigationService);
  private apiService = inject(PrivateApiService);
  private logger = inject(LoggerService);

  readonly messages = signal<Message[]>([]);

  private currentChannelId = computed(
    () => this.navService.activeChannelId() || this.navService.activeDMId(),
  );

  constructor() {
    this.logger.init(LoggerType.SERVICE_MESSAGE);

    this.initWebSocket();

    effect(() => {
      const currentChannelId = this.currentChannelId();
      if (currentChannelId) {
        this.logger.log(LoggerType.SERVICE_MESSAGE, 'Loading message history');
        this.loadMessageHistory(currentChannelId);
        return;
      }

      this.logger.log(LoggerType.SERVICE_MESSAGE, 'No channel');
      this.messages.set([]);
    });
  }

  public sendMessage(content: string, replyTarget?: Message): void {
    //this.dbService.saveMessage(message);

    const activeChannelId = this.navService.activeChannelId() || this.navService.activeDMId();
    const messagePayload: CreateMessagePayload = {
      content,
      replyToId: replyTarget ? replyTarget.id : null,
    };

    this.apiService.sendMessage(activeChannelId!, messagePayload).subscribe({
      next: (message) => {},
      error: (err) => {
        //Response to any errors - optimistic UI
      },
    });
  }

  private loadMessageHistory(channelId: string): void {
    this.apiService.getMessageHistory(channelId).subscribe({
      next: (messages) => this.messages.set(messages),
      error: (err) => this.logger.error(LoggerType.SERVICE_MESSAGE, 'Failed to load history', err),
    });
  }

  private initWebSocket(): void {
    //Listeners for sent messages, edits and deletes
    this.wsService.on(WSEventType.MESSAGE_RECEIVE).subscribe((message) => {
      const activeChannelId = this.navService.activeChannelId() || this.navService.activeDMId();

      if (message.channelId === activeChannelId) {
        this.messages.update((current) => [...current, message]);
      }
    });

    //Deletes
    this.wsService.on(WSEventType.MESSAGE_DELETE).subscribe((message) => {
      //Delete the message from the loaded channel if it exists in the history
      const activeChannelId = this.navService.activeChannelId() || this.navService.activeDMId();

      if (message.channelId === activeChannelId) {
        //this.messages.update((current) => current.filter((m) => m.id !== message.id));
        this.messages.update((current) =>
          current.map((m) => (m.id === message.id ? { ...m, content: null, deleted: true } : m)),
        );
      }
    });

    //Edits
    this.wsService.on(WSEventType.MESSAGE_EDIT).subscribe((message) => {
      console.log('Received edit');

      //Edit message from the loaded channel if it exists in the history
      const activeChannelId = this.navService.activeChannelId() || this.navService.activeDMId();

      if (message.channelId === activeChannelId) {
        this.messages.update((current) =>
          current.map((m) => (m.id === message.id ? { ...m, content: message.content } : m)),
        );
      }
    });
  }

  public editMessage(messageId: string, content: string) {
    const updatePayload: UpdateMessagePayload = {
      content,
    };

    this.apiService.editMessage(messageId, updatePayload).subscribe({
      next: () => {
        this.logger.log(LoggerType.SERVICE_MESSAGE, 'Successful edit');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_MESSAGE, 'Unsuccessful edit', err);
      },
    });
  }

  public deleteMessage(messageId: string) {
    //Make a HTTP request
    this.apiService.deleteMessage(messageId).subscribe({
      next: () => {
        //
        this.logger.log(LoggerType.SERVICE_MESSAGE, 'Successful delete');
      },
      error: (err) => {
        this.logger.error(LoggerType.SERVICE_MESSAGE, 'Unsuccessful delete', err);
      },
    });
  }

  public getMessage(messageId: string) {
    const currentChannelId = this.currentChannelId();
    if (!currentChannelId) return undefined;

    // Look in messages
    return this.messages().find((m) => m.id === messageId);
  }
}
