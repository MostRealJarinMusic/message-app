import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { ChannelService } from "./services/channel-service";
import { SignedRequest } from "../../types/types";
import { asyncHandler } from "../../utils/async-wrapper";
import { MessageService } from "./services/message-service";

export default function channelRoutes(wsManager: WebSocketManager): Router {
  const channelRoutes = Router();

  channelRoutes.delete(
    "/:channelId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await ChannelService.deleteChannel(req.params.channelId, wsManager);
      res.status(204).send();
    })
  );

  channelRoutes.post(
    "/:channelId/messages",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const message = await MessageService.sendMessage(
        req.params.channelId,
        req.signature!.id,
        req.body,
        wsManager
      );
      res.status(201).json(message);
    })
  );

  channelRoutes.get(
    "/:channelId/messages",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const messages = await MessageService.getMessages(req.params.channelId);
      res.json(messages);
    })
  );

  channelRoutes.patch(
    "/:channelId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await ChannelService.editChannel(
        req.params.channelId,
        req.body,
        wsManager
      );
      res.status(204).send();
    })
  );

  return channelRoutes;
}
