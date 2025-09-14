import { SignedSocket } from "../types/types";

export class ConnectionRegistry {
  private userSockets = new Map<string, Set<SignedSocket>>();
  private clientLastPong = new Map<SignedSocket, number>();

  addConnection(userId: string, ws: SignedSocket) {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());

    this.userSockets.get(userId)?.add(ws);
    this.clientLastPong.set(ws, Date.now());

    console.log(`WS: ${ws.signature?.username} connected`);
  }

  removeConnection(userId: string, ws: SignedSocket) {
    this.clientLastPong.delete(ws);
    console.log(`WS: ${ws.signature?.username} disconnected`);

    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(ws);
  }

  getSockets(userId: string): SignedSocket[] {
    return Array.from(this.userSockets.get(userId) ?? []);
  }

  getAllSockets(): SignedSocket[] {
    return Array.from(this.clientLastPong.keys());
  }

  updateLastPong(ws: SignedSocket) {
    this.clientLastPong.set(ws, Date.now());
    console.log(`WS: ${ws.signature!.username} pongs`);
  }

  getLastPong(ws: SignedSocket) {
    return this.clientLastPong.get(ws) || 0;
  }
}
