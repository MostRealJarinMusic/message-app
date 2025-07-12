import { effect, inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Message, PresenceUpdate, WSEventType } from '@common/types';
import { PrivateApiService } from '../api/private-api.service';
import { ChannelService } from '../channel/channel.service';

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
      if (currentChannel) this.loadMessageHistory(currentChannel);

      // const authorIds = [
      //   ...new Set(this.messageService.messages().map((m) => m.authorId)),
      // ];

      // this.userService.preloadUsers(authorIds);
    });
  }

  public sendMessage(content: string): void {
    //this.dbService.saveMessage(message);

    //Should use HTTP
    //Temporary message response code
    this.apiService
      .sendMessage(this.channelService.currentChannel()!, content)
      .subscribe({
        next: (message) => {
          //console.log(message);
          //Response to a successfully sent message
        },
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
    this.wsService.on<Message>(WSEventType.RECEIVE).subscribe((message) => {
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((current) => [...current, message]);
      }
    });

    //Deletes
    this.wsService.on<Message>(WSEventType.DELETED).subscribe((message) => {
      //Delete the message from the loaded channel if it exists in the history
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((current) =>
          current.filter((m) => m.id !== message.id)
        );
      }
    });

    //Edits
    this.wsService.on<Message>(WSEventType.EDITED).subscribe((message) => {
      //Edit message from the loaded channel if it exists in the history
      if (message.channelId === this.channelService.currentChannel()) {
        this.messages.update((currentMessages) =>
          currentMessages.map((m) =>
            m.id === message.id ? { ...m, content: message.content } : m
          )
        );
      }
    });

    //Prsence service code - here
    // this.wsService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
    //   next: (update) => {
    //     console.log(`${update.userId} is ${update.status}`)
    //   }
    // })
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
