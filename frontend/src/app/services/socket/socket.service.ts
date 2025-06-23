import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, map } from 'rxjs';
import { WSEvent, WSEventType } from '@common/types'

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: WebSocket;
  private eventStream$ = new Subject<WSEvent>();
  public isConnected = false;

  connect(token: string | null): void {
    if (!token) {
      console.log("Invalid token");
      return;
    }

    this.socket = new WebSocket(`ws://localhost:3000?token=${token}`);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Websocket connected');
    };

    this.socket.onmessage = async (event) => {
      try {
        const parsedMessage = await this.parseMessageData(event.data)
        const data: WSEvent = JSON.parse(parsedMessage);

        this.eventStream$.next(data);
      } catch (err) {
        console.error('Invalid message', err)
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      console.log('Websocket disconnected');
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  emit<T = any>(event: WSEventType, payload: T): void {
    if (!this.isConnected) return;
    const message: WSEvent = { event, payload };
    this.socket?.send(JSON.stringify(message)); 
  }

  on<T = any>(event: WSEventType): Observable<T> {
    return this.eventStream$.pipe(
      filter(e => e.event === event),
      map(e => e.payload as T)
    )
  }

  private async parseMessageData(data: any): Promise<string> {
    if (data instanceof Blob) return await data.text();
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    return data;
  }
}
