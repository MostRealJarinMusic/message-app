import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../../../../core/services/socket/socket.service';
import { Message, WSEventType } from '@common/types';
import { ChannelService } from 'src/app/features/channel/services/channel/channel.service';
import { PrivateApiService } from 'src/app/core/services/api/private-api.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private wsService = inject(SocketService);
  private channelService = inject(ChannelService);
  private apiService = inject(PrivateApiService);

  readonly messages = signal<Message[]>([]);

  constructor() {
    this.initWebSocket();

    //Load message history
    effect(() => {
      const currentChannel = this.channelService.currentChannel();
      if (currentChannel) {
        console.log('Loading message history');
        this.loadMessageHistory(currentChannel);
      } else {
        console.log('No channel');
        this.messages.set([]);
      }
    });
  }

  public sendMessage(content: string): void {
    //this.dbService.saveMessage(message);

    //Should use HTTP
    //Temporary message response code
    this.apiService
      .sendMessage(this.channelService.currentChannel()!, content)
      .subscribe({
        next: (message) => {},
        error: (err) => {
          //Response to any errors - optimistic UI
        },
      });
  }

  public loadMessageHistory(channelId: string): void {
    this.apiService.getMessageHistory(channelId).subscribe({
      next: (messages) => this.messages.set(messages),
      error: (err) => console.error('Failed to load history', err),
    });
  }

  private initWebSocket(): void {
    //Listeners for sent messages, edits and deletes
    this.wsService.on(WSEventType.RECEIVE).subscribe((message) => {
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((current) => [...current, message]);
      }
    });

    //Deletes
    this.wsService.on(WSEventType.DELETED).subscribe((message) => {
      //Delete the message from the loaded channel if it exists in the history
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((current) =>
          current.filter((m) => m.id !== message.id)
        );
      }
    });

    //Edits
    this.wsService.on(WSEventType.EDITED).subscribe((message) => {
      //Edit message from the loaded channel if it exists in the history
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((currentMessages) =>
          currentMessages.map((m) =>
            m.id === message.id ? { ...m, content: message.content } : m
          )
        );
      }
    });
  }

  public editMessage(messageId: string, newContent: string) {
    this.apiService.editMessage(messageId, newContent).subscribe({
      next: () => {
        console.log('Successful edit');
      },
      error: (err) => {
        console.error('Unsuccessful edit', err);
      },
    });
  }

  public deleteMessage(messageId: string) {
    //Make a HTTP request
    this.apiService.deleteMessage(messageId).subscribe({
      next: () => {
        //
        console.log('Successful delete');
      },
      error: (err) => {
        console.error('Unsuccessful delete', err);
      },
    });
  }
}
