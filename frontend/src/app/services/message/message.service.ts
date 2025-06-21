import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { PouchService } from '../pouch/pouch.service';
import { Observable } from 'rxjs';
import { Message } from '../../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private wsService: SocketService, private dbService: PouchService) { }

  public sendMessage(content: string): void {

  }

  public getMessages(channelId: string): Observable<Message[]> {
    return new Observable
  }
}
