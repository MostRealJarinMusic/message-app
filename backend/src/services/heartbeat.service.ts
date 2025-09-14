import { ConnectionRegistry } from "../websocket/connection-registry";

export class HeartbeatService {
  constructor(
    private registry: ConnectionRegistry,
    private readonly interval: number = 60_000,
    private readonly timeout: number = 120_000
  ) {}

  start() {
    setInterval(() => this.checkConnections(), this.interval);
  }

  private checkConnections() {
    const now = Date.now();
    console.log("WS: Ping");

    this.registry.getAllSockets().forEach((ws) => {
      const lastPong = this.registry.getLastPong(ws);
      if (now - lastPong > this.timeout) {
        console.log(
          `Heartbeat: client timed out, terminating ${ws.signature!.username}`
        );
        ws.terminate();
        return;
      }

      ws.send(JSON.stringify({ event: "ping", payload: { timestamp: now } }));
    });
  }
}
