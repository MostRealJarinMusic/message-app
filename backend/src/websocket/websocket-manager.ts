import http from "http";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { config } from "../config";
import {
  AnyWSEvent,
  PresenceStatus,
  PresenceUpdate,
  UserSignature,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from "../../../common/types";
import { EventBusPort, SignedSocket } from "../types/types";
import { AuthService } from "../services/auth.service";
import { RelevanceService } from "../services/relevance.service";
import { ConnectionRegistry } from "./connection-registry";
import { HeartbeatService } from "../services/heartbeat.service";
import { PresenceService } from "../services/presence.service";
import { WebSocketRouter } from "./websocket-router";

export class WebSocketManager {
  private wss!: WebSocket.Server;

  constructor(
    private readonly authService: AuthService,
    private readonly relevanceService: RelevanceService,
    private readonly heartbeatService: HeartbeatService,
    private readonly presenceService: PresenceService,
    private readonly registry: ConnectionRegistry,
    private readonly router: WebSocketRouter,
    private readonly eventBus: EventBusPort
  ) {}

  init(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
    this.setupEventBusSubscriptions();

    this.heartbeatService.start();
  }

  private setupEventBusSubscriptions() {
    const broadcastEvents: WSEventType[] = [
      WSEventType.MESSAGE_RECEIVE,
      WSEventType.MESSAGE_EDIT,
      WSEventType.MESSAGE_DELETE,
      WSEventType.CHANNEL_CREATE,
      WSEventType.CHANNEL_UPDATE,
      WSEventType.CHANNEL_DELETE,
      WSEventType.CATEGORY_CREATE,
      WSEventType.CATEGORY_UPDATE,
      WSEventType.CATEGORY_DELETE,
      WSEventType.SERVER_CREATE,
      WSEventType.SERVER_UPDATE,
      WSEventType.SERVER_DELETE,
      WSEventType.SERVER_MEMBER_ADD,
      WSEventType.PRESENCE,
      WSEventType.FRIEND_REQUEST_SENT,
      WSEventType.FRIEND_REQUEST_RECEIVE,
      WSEventType.FRIEND_REQUEST_UPDATE,
      WSEventType.FRIEND_REQUEST_DELETE,
      WSEventType.FRIEND_ADD,
      WSEventType.DM_CHANNEL_CREATE,
      WSEventType.USER_UPDATE,
      WSEventType.USER_SERVER_JOIN,
    ];

    broadcastEvents.forEach((broadcastEvent) =>
      this.eventBus.subscribe(broadcastEvent, (payload, targetIds) => {
        if (targetIds) {
          this.broadcastToGroup(broadcastEvent, payload, targetIds);
          return;
        }

        this.broadcastToAll(broadcastEvent, payload);
      })
    );

    this.eventBus.subscribe(WSEventType.PRESENCE, async (update) => {
      const relatedUserIds = await this.relevanceService.getRelevantUserIds(
        update.userId
      );
      this.broadcastToGroup(WSEventType.PRESENCE, update, relatedUserIds);
    });
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

  //#region Broadcasting and single DMs
  private broadcastToAll<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T]
  ) {
    this.broadcast(event, payload, Array.from(this.wss.clients));
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

  private broadcastToGroup<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    ids: string[]
  ) {
    this.broadcast(event, payload, this.getSocketsFromIds(ids));
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
