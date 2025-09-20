import { Request, Response, Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { ChannelService } from "../services/channel.service";
import { SignedRequest } from "../types/types";
import { asyncHandler } from "../utils/async-wrapper";
import { MessageService } from "../services/message.service";

export default function channelRoutes(
  channelService: ChannelService,
  messageService: MessageService
): Router {
  const channelRoutes = Router();

  channelRoutes.delete(
    "/:channelId",
    asyncHandler(async (req: Request, res: Response) => {
      await channelService.deleteChannel(req.params.channelId);
      res.status(204).send();
    })
  );

  channelRoutes.post(
    "/:channelId/messages",
    asyncHandler(async (req: SignedRequest, res: Response) => {
      const message = await messageService.sendMessage(
        req.params.channelId,
        req.signature!.id,
        req.body
      );
      res.status(201).json(message);
    })
  );

  channelRoutes.get(
    "/:channelId/messages",
    asyncHandler(async (req: Request, res: Response) => {
      const messages = await messageService.getMessages(req.params.channelId);
      res.json(messages);
    })
  );

  channelRoutes.patch(
    "/:channelId",
    asyncHandler(async (req: Request, res: Response) => {
      await channelService.editChannel(req.params.channelId, req.body);
      res.status(204).send();
    })
  );

  return channelRoutes;
}
