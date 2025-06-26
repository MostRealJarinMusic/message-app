import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Message, PresenceUpdate, WSEventType } from '@common/types';
import { SessionService } from '../session/session.service';
import { PrivateApiService } from '../api/private-api.service';
import { ChannelService } from '../channel/channel.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private wsService: SocketService, 
    private sessionService: SessionService, 
    private channelService: ChannelService,
    private apiService: PrivateApiService
  ) { 

    //console.log("Message service created")
    this.initWebSocket();
  }

  public sendMessage(content: string): void {
    const message: Partial<Message> = {
      content,
      authorId: this.sessionService.currentUser?.id,
      channelId: this.channelService.currentChannel!,
      createdAt: new Date().toISOString()
    }

    //this.dbService.saveMessage(message);
    this.wsService.emit(WSEventType.SEND, message);
  }

  public loadMessageHistory(channelId: string): void {
    this.apiService.getMessageHistory(channelId).subscribe({
      next: (history) => {
        this.messagesSubject.next(history);
        console.log('Loaded history');
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        console.log('Failed to load history')
      }
    });
  }

  private initWebSocket(): void {
    combineLatest([
      this.wsService.on<Message>(WSEventType.RECEIVE),
      this.channelService.currentChannelId$
    ]).subscribe(([message, selectedChannelId]) => {
      if (message.channelId === selectedChannelId) {
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, message]);
      }
    })

    // this.wsService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
    //   next: (update) => {
    //     console.log(`${update.userId} is ${update.status}`)
    //   } 
    // })
  }


}
