import { Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";

export default function friendRoutes(wsManager: WebSocketManager): Router {
  const friendRoutes = Router();

  return friendRoutes;
}
