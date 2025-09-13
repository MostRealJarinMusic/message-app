import http from "http";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { config } from "../config";
import {
  PresenceStatus,
  PresenceUpdate,
  UserSignature,
  WSEvent,
  WSEventPayload,
  WSEventType,
} from "../../../common/types";
import { EventBusPort } from "../types/types";

const HEARTBEAT_INTERVAL = 60000;
const TIMEOUT_LIMIT = 120000;

export class WebSocketManager {
  private wss: WebSocket.Server;
  private clientLastPong = new Map<WebSocket, number>();
  private userSockets: Map<string, Set<WebSocket>>;
  private presenceStore: Map<string, string>;

  constructor(server: http.Server, private readonly eventBus: EventBusPort) {
    this.userSockets = new Map<string, Set<WebSocket>>();
    this.presenceStore = new Map<string, string>();

    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
    setInterval(this.pingClients.bind(this), HEARTBEAT_INTERVAL);

    this.setupEventBusSubscriptions();
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
  }

  private handleConnection(ws: WebSocket, req: http.IncomingMessage) {
    const token = new URLSearchParams(req.url?.split("?")[1] || "").get(
      "token"
    );
    if (!token) return ws.close(); //Invalid token

    try {
      const signature = jwt.verify(token, config.jwtSecret) as UserSignature;
      const userId = signature.id;
      (ws as any).signature = signature;

      this.clientLastPong.set(ws, Date.now());

      //Send initial presence
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(ws);

      if (this.userSockets.get(userId)?.size === 1) {
        this.updatePresence(userId, "online" as PresenceStatus);
      }

      ws.on("message", async (message) => await this.routeMessage(ws, message));

      ws.on("close", () => {
        const id = ((ws as any).signature as UserSignature).id;

        this.clientLastPong.delete(ws);
        console.log(`WS: ${(ws as any).signature.username} disconnected`);

        const sockets = this.userSockets.get(id);
        if (!sockets) return;

        sockets.delete(ws);

        if (sockets.size === 0) {
          this.userSockets.delete(id);
          this.updatePresence(id, "offline" as PresenceStatus);
        }
      });
    } catch {
      ws.close();
    }
  }

  //#region Presence
  private updatePresence(userId: string, status: PresenceStatus) {
    const previous = this.presenceStore.get(userId);
    if (previous === status) return;

    this.presenceStore.set(userId, status);

    //Temporary - should only broadcast to friends, users in the same servers
    this.broadcastToAll("presence:update" as WSEventType, {
      userId: userId,
      status: status,
    });
  }

  public getPresenceSnapshot(userIds: string[]): PresenceUpdate[] {
    return userIds.map((id) => ({
      userId: id,
      status: (this.presenceStore.get(id) || "offline") as PresenceStatus,
    }));
  }
  //#endregion

  //#region WS event handling
  private async routeMessage(ws: WebSocket, message: WebSocket.RawData) {
    try {
      const { event, payload }: WSEvent<any> = JSON.parse(message.toString());
      const signature: UserSignature = (ws as any).signature;

      switch (event) {
        case "pong":
          this.clientLastPong.set(ws, Date.now());
          console.log(`WS: Pong from ${signature.username}`);
          break;
        default:
          console.warn("WS: Unhandled event", event);
      }
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
  public broadcastToAll<T extends WSEventType>(
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

  public broadcastToGroup<T extends WSEventType>(
    event: T,
    payload: WSEventPayload[T],
    ids: string[]
  ) {
    this.broadcast(event, payload, this.getSocketsFromIds(ids));
  }

  private getSocketsFromIds(ids: string[]) {
    const result: WebSocket[] = [];
    for (const id of ids) {
      const sockets = this.userSockets.get(id);
      if (sockets) {
        result.push(...sockets);
      }
    }
    return result;
  }
  //#endregion

  //#region Connection checking
  private pingClients() {
    const now = Date.now();
    console.log("WS: Ping");
    //console.log(this.wss.clients.size);

    this.wss.clients.forEach((ws) => {
      const lastPong = this.clientLastPong.get(ws) || 0;
      if (now - lastPong > TIMEOUT_LIMIT) {
        console.log(
          `WS: No pong received from ${
            (ws as any).signature
          } - terminating client`
        );
        ws.terminate();
        return;
      }

      ws.send(JSON.stringify({ event: "ping", payload: { timestamp: now } }));
    });
  }
  //#endregion
}
