import { Router } from "express";
import { WebSocketManager } from "server/ws/websocket-manager";

export default function friendRequestRoutes(
  wsManager: WebSocketManager
): Router {
  const friendRequestRoutes = Router();

  return friendRequestRoutes;
}
