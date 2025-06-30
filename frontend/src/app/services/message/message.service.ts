import { inject, Injectable, signal } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Message, PresenceUpdate, WSEventType } from '@common/types';
import { SessionService } from '../session/session.service';
import { PrivateApiService } from '../api/private-api.service';
import { ChannelService } from '../channel/channel.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private wsService = inject(SocketService);
  private sessionService = inject(SessionService);
  private channelService = inject(ChannelService);
  private apiService = inject(PrivateApiService);

  readonly messages = signal<Message[]>([]);

  constructor() {
    this.initWebSocket();
  }

  public sendMessage(content: string): void {
    //this.dbService.saveMessage(message);
    // this.wsService.emit(WSEventType.SEND, message);

    //Should use HTTP
    //Temporary message response code
    this.apiService
      .sendMessage(this.channelService.currentChannel()!, content)
      .subscribe({
        next: (message) => {
          //console.log(message);
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

    //Prsence service code - here
    // this.wsService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
    //   next: (update) => {
    //     console.log(`${update.userId} is ${update.status}`)
    //   }
    // })
  }

  public editMessage() {}
  public deleteMessage(messageId: string) {
    //Make a HTTP request
  }
}
