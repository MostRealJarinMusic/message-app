import { Application } from "express";
import authRoutes from "./auth-routes";
import userRoutes from "./user-routes";
import channelRoutes from "./channel-routes";
import serverRoutes from "./server-routes";
import { WebSocketManager } from "../ws/websocket-manager";
import messageRoutes from "./message-routes";
import categoryRoutes from "./category-routes";
import friendRequestRoutes from "./friend-request-routes";
import friendRoutes from "./friend-routes";
import directMessageRoutes from "./direct-message-routes";

export function registerRoutes(app: Application, wsManager: WebSocketManager) {
  app.use("/api/public/auth", authRoutes);
  app.use("/api/private/channels", channelRoutes(wsManager));
  app.use("/api/private/categories", categoryRoutes(wsManager));
  app.use("/api/private/servers", serverRoutes(wsManager));
  app.use("/api/private/users", userRoutes);
  app.use("/api/private/messages", messageRoutes(wsManager));
  app.use("/api/private/friend-requests", friendRequestRoutes(wsManager));
  app.use("/api/private/friends", friendRoutes(wsManager));
  app.use("/api/private/direct-messages", directMessageRoutes(wsManager));
}
