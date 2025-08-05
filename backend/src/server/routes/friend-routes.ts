import { Request, Response, Router } from "express";
import { WebSocketManager } from "../ws/websocket-manager";
import { authMiddleware } from "../..//middleware/auth-middleware";
import { FriendHandler } from "./handlers/friend-handler";
import { SignedRequest } from "../../types/types";

export default function friendRoutes(wsManager: WebSocketManager): Router {
  const friendRoutes = Router();

  friendRoutes.get("", authMiddleware, async (req: Request, res: Response) => {
    FriendHandler.getFriends(req as SignedRequest, res);
  });

  return friendRoutes;
}
