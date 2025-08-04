import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { ChannelHandler } from "./handlers/channel-handler";
import { SignedRequest } from "types/types";

export default function channelRoutes(wsManager: WebSocketManager): Router {
  const channelRoutes = Router();

  channelRoutes.delete(
    "/:channelId",
    authMiddleware,
    async (req: Request, res: Response) => {
      ChannelHandler.deleteChannel(req, res, wsManager);
    }
  );

  channelRoutes.post(
    "/:channelId/messages",
    authMiddleware,
    async (req: Request, res: Response) => {
      ChannelHandler.sendMessage(req as SignedRequest, res, wsManager);
    }
  );

  channelRoutes.get(
    "/:channelId/messages",
    authMiddleware,
    async (req: Request, res: Response) => {
      ChannelHandler.getMessages(req, res);
    }
  );

  channelRoutes.patch(
    "/:channelId",
    authMiddleware,
    async (req: Request, res: Response) => {
      ChannelHandler.editChannel(req, res, wsManager);
    }
  );

  return channelRoutes;
}
