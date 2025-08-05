import http from "http";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { config } from "../../config";
import {
  PresenceStatus,
  PresenceUpdate,
  UserSignature,
  WSEvent,
  WSEventType,
} from "../../../../common/types";

const HEARTBEAT_INTERVAL = 60000;
const TIMEOUT_LIMIT = 120000;

export class WebSocketManager {
  private wss: WebSocket.Server;
  private clientLastPong = new Map<WebSocket, number>();
  private userSockets: Map<string, Set<WebSocket>>;
  private presenceStore: Map<string, string>;

  constructor(server: http.Server) {
    this.userSockets = new Map<string, Set<WebSocket>>();
    this.presenceStore = new Map<string, string>();

    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
    setInterval(this.pingClients.bind(this), HEARTBEAT_INTERVAL);
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
        this.updatePresence(userId, "online");
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
          this.updatePresence(id, "offline");
        }
      });
    } catch {
      ws.close();
    }
  }

  //#region Presence
  private updatePresence(userId: string, status: string) {
    const previous = this.presenceStore.get(userId);
    if (previous === status) return;

    this.presenceStore.set(userId, status);

    this.broadcastToAll("presence:update", {
      userId: userId,
      status: status,
    } as PresenceUpdate);
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

  private packageMessage(event: string, payload: any) {
    return JSON.stringify({ event, payload });
  }
  //#endregion

  //#region Broadcasting and single DMs
  public broadcastToUser(event: string, payload: any, targetId: string) {
    const sockets = this.userSockets.get(targetId);
    if (sockets) this.broadcastToGroup(event, payload, Array.from(sockets));
  }

  public broadcastToAll(event: string, payload: any) {
    this.broadcastToGroup(event, payload, Array.from(this.wss.clients));
  }

  public broadcastToGroup(
    event: string,
    payload: any,
    targetGroup: WebSocket[]
  ) {
    const message = this.packageMessage(event, payload);
    targetGroup.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastToServer(
    event: string,
    payload: any,
    serverUserIds: string[]
  ) {
    this.broadcastToGroup(
      event,
      payload,
      this.getSocketsFromIds(serverUserIds)
    );
  }

  public broadcastToFriends(event: string, payload: any, friendIds: string[]) {
    this.broadcastToGroup(event, payload, this.getSocketsFromIds(friendIds));
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
