import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { Observable } from 'rxjs';
import { Message, WSEventType } from '../../models/message.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private wsService: SocketService, private authService: AuthService) { }

  public sendMessage(content: string): void {
    const message: Message = {
      id: uuidv4(),
      content,
      authorId: this.authService.getUsername(),
      createdAt: new Date()
    }

    //this.dbService.saveMessage(message);
    this.wsService.emit(WSEventType.SEND, message);
  }

  public onMessage(): Observable<Message> {
    return this.wsService.on<Message>(WSEventType.RECEIVE);
  }

  public getMessages(channelId: string): Observable<Message[]> {
    return new Observable
  }
}
