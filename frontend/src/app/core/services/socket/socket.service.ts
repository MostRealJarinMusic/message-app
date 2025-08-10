import { effect, inject, Injectable } from '@angular/core';
import { filter, Observable, Subject, map, timer } from 'rxjs';
import {
  PresenceStatus,
  PresenceUpdate,
  Timestamp,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from '@common/types';
import { SessionService } from '../session/session.service';
import { AuthTokenService } from '../authtoken/auth-token.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: WebSocket;
  private eventStream$ = new Subject<WSEvent<any>>();
  public isConnected = false;

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private explicitClose = false;

  private heartBeatInterval?: ReturnType<typeof setInterval>;
  private readonly heartbeatRate = 30000;

  connect(token: string | null): void {
    if (
      this.socket &&
      (this.isConnected || this.socket.readyState < WebSocket.CLOSING)
    ) {
      console.log('Got here');
      return;
    }

    if (!token) {
      console.log('Invalid token');
      return;
    }

    this.disconnect();

    this.explicitClose = false;
    this.socket = new WebSocket(`ws://localhost:3000?token=${token}`);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Websocket connected');

      this.reconnectAttempts = 0;
      //this.startHeartbeat();
    };

    this.socket.onmessage = async (event) => {
      try {
        const parsedMessage = await this.parseMessageData(event.data);
        const data: WSEvent<any> = JSON.parse(parsedMessage);

        if (data.event === WSEventType.PING) {
          const latency = Date.now() - data.payload.timestamp;
          //console.log(`Latency: ${latency}`);
          this.emit(WSEventType.PONG, { timestamp: Date.now() });
        }

        this.eventStream$.next(data);
      } catch (err) {
        console.error('Invalid message', err);
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      //this.stopHeartbeat();

      console.log('Websocket disconnected');

      if (!this.explicitClose) {
        this.reconnect(token);
      }
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  disconnect(): void {
    this.explicitClose = true;
    this.socket?.close();
    this.socket = undefined;
  }

  emit<T extends WSEventType>(event: T, payload: WSEventPayload[T]): void {
    if (!this.isConnected) {
      console.log('No WebSocket connection - attempt to reconnect logic');
      return;
    }
    const message: WSEvent<T> = { event, payload };
    this.socket?.send(JSON.stringify(message));
  }

  on<T extends WSEventType>(event: T): Observable<WSEventPayload[T]> {
    return this.eventStream$.pipe(
      filter((e) => e.event === event),
      map((e) => e.payload)
    );
  }

  private reconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * this.reconnectAttempts, 5000);
    timer(delay).subscribe(() => {
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect(token);
    });
  }

  // private startHeartbeat() {
  //   this.heartBeatInterval = setInterval(() => {
  //     if (this.isConnected) {
  //       const timestamp = Date.now();
  //       this.emit<Timestamp>(WSEventType.PING, timestamp);
  //     }
  //   }, this.heartbeatRate);
  // }

  // private stopHeartbeat() {
  //   if (this.heartBeatInterval) {
  //     clearInterval(this.heartBeatInterval);
  //     this.heartBeatInterval = undefined;
  //   }
  // }

  private async parseMessageData(data: any): Promise<string> {
    if (data instanceof Blob) return await data.text();
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    return data;
  }
}
