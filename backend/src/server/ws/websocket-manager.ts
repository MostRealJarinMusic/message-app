import http from "http";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { config } from "../../config";
import { Message, UserSignature, WSEvent } from "@common/types";
import { MessageRepo } from "../../db/repos/message.repo";

const HEARTBEAT_INTERVAL = 60000;
const TIMEOUT_LIMIT = 120000;

export class WebSocketManager {
  private wss: WebSocket.Server;
  private clientLastPong = new Map<WebSocket, number>();

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
    setInterval(this.heartbeat.bind(this), HEARTBEAT_INTERVAL);
  }

  private handleConnection(ws: WebSocket, req: http.IncomingMessage) {
    const token = new URLSearchParams(req.url?.split("?")[1] || "").get(
      "token"
    );
    if (!token) return ws.close();

    try {
      const signature = jwt.verify(token, config.jwtSecret) as UserSignature;
      (ws as any).signature = signature;
      console.log(`WS: ${signature.username} connected`);
      this.clientLastPong.set(ws, Date.now());

      ws.on("message", async (message) => await this.routeMessage(ws, message));
      ws.on("close", () => {
        this.clientLastPong.delete(ws);
        console.log(`WS: ${(ws as any).signature.username} disconnected`);
      });
    } catch {
      ws.close();
    }
  }

  private async routeMessage(ws: WebSocket, message: WebSocket.RawData) {
    try {
      const { event, payload }: WSEvent<any> = JSON.parse(message.toString());
      const signature: UserSignature = (ws as any).signature;

      switch (event) {
        case "presence:update":
          // const presenceUpdate: PresenceUpdate = { ...payload };

          // broadcast("presence:update", { ...presenceUpdate });
          break;
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

  public broadcast(event: string, payload: any) {
    const message = JSON.stringify({ event, payload });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private heartbeat() {
    const now = Date.now();
    console.log("WS: Ping");
    console.log(this.wss.clients.size);

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
}
