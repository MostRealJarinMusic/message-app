import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { MessageHandler } from "./handlers/message-handler";

export default function messageRoutes(wsManager: WebSocketManager): Router {
  const messageRoutes = Router();

  messageRoutes.delete(
    "/:messageId",
    authMiddleware,
    async (req: Request, res: Response) => {
      MessageHandler.deleteMessage(req, res, wsManager);
    }
  );

  messageRoutes.patch(
    "/:messageId",
    authMiddleware,
    async (req: Request, res: Response) => {
      MessageHandler.editMessage(req, res, wsManager);
    }
  );

  return messageRoutes;
}
