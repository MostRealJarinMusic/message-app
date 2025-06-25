import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, map, timer } from 'rxjs';
import { PresenceStatus, PresenceUpdate, WSEvent, WSEventType } from '@common/types'
import { AuthTokenService } from '../authtoken/authtoken.service';
import { UserService } from '../user/user.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: WebSocket;
  private eventStream$ = new Subject<WSEvent>();
  public isConnected = false;

  private reconnectAttempts = 0;
  private maxAttempts = 10;
  private explicitClose = false;

  constructor(private userService: UserService, private tokenService: AuthTokenService) {
    console.log("Socket service created")

    this.userService.user$.subscribe(user => {
      const token = this.tokenService.getToken();
      if (user && token) {
        this.connect(token);
      }
    })
  }

  connect(token: string | null): void {
    if (this.socket && this.isConnected) return;

    if (!token) {
      console.log("Invalid token");
      return;
    }

    this.explicitClose = false;
    this.socket = new WebSocket(`ws://localhost:3000?token=${token}`);

    this.socket.onopen = async () => {
      this.isConnected = true;
      console.log('Websocket connected');

      this.reconnectAttempts = 0;

      //Presence message
      //this.emit<PresenceUpdate>(WSEventType.PRESENCE, { userId: await this.authService.getID(), status: PresenceStatus.ONLINE })
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

      if (!this.explicitClose) {
        this.reconnect(token);
      }
      //Presence message
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  emit<T = any>(event: WSEventType, payload: T): void {
    if (!this.isConnected) {
      console.log("No WebSocket connection - attempt to reconnect logic")
      return;
    }
    const message: WSEvent = { event, payload };
    this.socket?.send(JSON.stringify(message)); 
  }

  on<T = any>(event: WSEventType): Observable<T> {
    return this.eventStream$.pipe(
      filter(e => e.event === event),
      map(e => e.payload as T)
    )
  }

  private reconnect(token: string) {
    if (this.reconnectAttempts >= this.maxAttempts) return;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * this.reconnectAttempts, 5000);
    timer(delay).subscribe(() => {
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connect(token);
    })

  }

  private async parseMessageData(data: any): Promise<string> {
    if (data instanceof Blob) return await data.text();
    if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
    return data;
  }
}
