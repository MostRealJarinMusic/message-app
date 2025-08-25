import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../../middleware/auth-middleware";
import { DirectMessageHandler } from "./handlers/direct-message-handler";
import { SignedRequest } from "../../types/types";

export default function directMessageRoutes(
  wsManager: WebSocketManager
): Router {
  const directMessageRoutes = Router();

  directMessageRoutes.get(
    "/channels",
    authMiddleware,
    async (req: Request, res: Response) => {
      DirectMessageHandler.getChannels(req as SignedRequest, res);
    }
  );

  return directMessageRoutes;
}
