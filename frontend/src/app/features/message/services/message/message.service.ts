import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { LoggerType, Message, WSEventType } from '@common/types';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';
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

  constructor() {
    this.logger.init(LoggerType.SERVICE_MESSAGE);

    this.initWebSocket();

    //Load message history
    effect(() => {
      const currentChannel = this.navService.currentChannelId();
      if (currentChannel) {
        this.logger.log(LoggerType.SERVICE_MESSAGE, 'Loading message history');
        this.loadMessageHistory(currentChannel);
      } else {
        this.logger.log(LoggerType.SERVICE_MESSAGE, 'No channel');
        this.messages.set([]);
      }
    });
  }

  public sendMessage(content: string): void {
    //this.dbService.saveMessage(message);

    //Should use HTTP
    //Temporary message response code
    this.apiService.sendMessage(this.navService.currentChannelId()!, content).subscribe({
      next: (message) => {},
      error: (err) => {
        //Response to any errors - optimistic UI
      },
    });
  }

  public loadMessageHistory(channelId: string): void {
    this.apiService.getMessageHistory(channelId).subscribe({
      next: (messages) => this.messages.set(messages),
      error: (err) => this.logger.error(LoggerType.SERVICE_MESSAGE, 'Failed to load history', err),
    });
  }

  private initWebSocket(): void {
    //Listeners for sent messages, edits and deletes
    this.wsService.on(WSEventType.RECEIVE).subscribe((message) => {
      if (message.channelId === this.navService.currentChannelId()) {
        this.messages.update((current) => [...current, message]);
      }
    });

    //Deletes
    this.wsService.on(WSEventType.DELETED).subscribe((message) => {
      //Delete the message from the loaded channel if it exists in the history
      if (message.channelId === this.navService.currentChannelId()) {
        this.messages.update((current) => current.filter((m) => m.id !== message.id));
      }
    });

    //Edits
    this.wsService.on(WSEventType.EDITED).subscribe((message) => {
      //Edit message from the loaded channel if it exists in the history
      if (message.channelId === this.navService.currentChannelId()) {
        this.messages.update((currentMessages) =>
          currentMessages.map((m) =>
            m.id === message.id ? { ...m, content: message.content } : m,
          ),
        );
      }
    });
  }

  public editMessage(messageId: string, newContent: string) {
    this.apiService.editMessage(messageId, newContent).subscribe({
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
}
