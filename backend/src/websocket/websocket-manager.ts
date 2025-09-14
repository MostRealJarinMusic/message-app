import http from "http";
import WebSocket from "ws";
import {
  AnyWSEvent,
  PresenceStatus,
  WSEventPayload,
  WSEventType,
} from "../../../common/types";
import { SignedSocket } from "../types/types";
import { AuthService } from "../services/auth.service";
import { ConnectionRegistry } from "./connection-registry";
import { HeartbeatService } from "../services/heartbeat.service";
import { PresenceService } from "../services/presence.service";
import { WebSocketRouter } from "./websocket-router";

export class WebSocketManager {
  private wss!: WebSocket.Server;

  constructor(
    private readonly authService: AuthService,
    private readonly heartbeatService: HeartbeatService,
    private readonly presenceService: PresenceService,
    private readonly registry: ConnectionRegistry,
    private readonly router: WebSocketRouter
  ) {}

  init(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));

    this.heartbeatService.start();
  }

  private handleConnection(ws: SignedSocket, req: http.IncomingMessage) {
    const token = new URLSearchParams(req.url?.split("?")[1] || "").get(
      "token"
    );
    if (!token) return ws.close(); // No token

    try {
      const signature = this.authService.verifyToken(token);
      const userId = signature.id;

      ws.signature = signature;
      this.registry.addConnection(userId, ws);

      if (this.registry.getSockets(userId).length === 1) {
        this.presenceService.updateStatus({
          userId,
          status: "online" as PresenceStatus,
        });
      }

      ws.on("message", async (message) => await this.routeMessage(ws, message));

      ws.on("close", () => {
        this.registry.removeConnection(userId, ws);

        if (this.registry.getSockets(userId).length === 0) {
          this.presenceService.updateStatus({
            userId,
            status: "offline" as PresenceStatus,
          });
        }
      });
    } catch (err) {
      console.error(err);
      ws.close();
    }
  }

  //#region WS event handling
  private async routeMessage(ws: WebSocket, message: WebSocket.RawData) {
    try {
      const parsedEvent: AnyWSEvent = JSON.parse(message.toString());
      await this.router.handle(parsedEvent, ws);
    } catch (err) {
      console.error("WS: Invalid message format", err);
    }
  }

  private packageMessage<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T]
  ) {
    return JSON.stringify({ event, payload });
  }
  //#endregion

  //#region Broadcasting
  public broadcastToAll<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T]
  ) {
    this.broadcast(event, payload, Array.from(this.wss.clients));
  }

  public broadcastToGroup<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    ids: string[]
  ) {
    this.broadcast(event, payload, this.getSocketsFromIds(ids));
  }

  public broadcastToUser<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    id: string
  ) {
    this.broadcast(event, payload, this.getSocketsFromIds([id]));
  }

  private broadcast<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    targets: WebSocket[]
  ) {
    if (!targets) return;

    const message = this.packageMessage(event, payload);
    targets.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private getSocketsFromIds(ids: string[]) {
    const result: WebSocket[] = [];
    for (const id of ids) {
      const sockets = this.registry.getSockets(id); //this.userSockets.get(id);
      if (sockets) {
        result.push(...sockets);
      }
    }
    return result;
  }
  //#endregion
}
