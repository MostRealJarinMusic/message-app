import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message, PresenceUpdate, WSEventType } from '@common/types';
import { ApiService } from '../api/api.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private wsService: SocketService, private userService: UserService, private apiService: ApiService) { 
    console.log("Message service created")
    this.initWebSocket();
  }

  public sendMessage(content: string): void {
    const message: Partial<Message> = {
      content,
      authorId: this.userService.getCurrentUser()?.id,
      createdAt: new Date().toISOString()
    }

    console.log(message)

    //this.dbService.saveMessage(message);
    this.wsService.emit(WSEventType.SEND, message);
  }

  public loadMessageHistory(): void {
    this.apiService.get<Message[]>('messages').subscribe({
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
    this.wsService.on<Message>(WSEventType.RECEIVE).subscribe({
      next: (message) => {
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, message]);
      }
    });


    // this.wsService.on<PresenceUpdate>(WSEventType.PRESENCE).subscribe({
    //   next: (update) => {
    //     console.log(`${update.userId} is ${update.status}`)
    //   } 
    // })
  }


}
