import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message, WSEventType } from '@common/types';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private wsService: SocketService, private authService: AuthService, private apiService: ApiService) { 
    this.initWebSocket();
  }

  public sendMessage(content: string): void {
    const message: Message = {
      id: uuidv4(),
      content,
      authorId: this.authService.getUsername(),
      createdAt: new Date().toISOString()
    }

    //this.dbService.saveMessage(message);
    this.wsService.emit(WSEventType.SEND, message);
  }

  public loadMessageHistory(): void {
    this.apiService.get<Message[]>('messages').subscribe({
      next: (history) => this.messagesSubject.next(history),
      error: (err) => console.error('Failed to load history:', err)
    });
  }

  private initWebSocket(): void {
    this.wsService.on<Message>(WSEventType.RECEIVE).subscribe({
      next: (message) => {
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, message]);
      }
    })
  }


}
