import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: WebSocket;
  private messagesSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messagesSubject.pipe(filter(Boolean))

  constructor(private auth: AuthService) {}

  connect(): void {
    const token = this.auth.getToken();
    if (!token) {
      console.log("Invalid token")
      return;
    }

    this.socket = new WebSocket(`ws://localhost:3000?token=${token}`);

    this.socket.onmessage = async (event) => {
      try {
        const data = await this.parseMessageData(event.data)
        const msg = JSON.parse(data);

        console.log('Message:', msg);

        this.messagesSubject.next({
          ...msg,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Message processing error: ', error)
      }
    };
  }

  send(message: string): void {
    this.socket?.send(JSON.stringify({ message }));
  }

  private async parseMessageData(data: any): Promise<string> {
    if (data instanceof Blob) return await data.text();
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    return data;
  }
  
}
