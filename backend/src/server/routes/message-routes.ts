import { Request, Response, Router } from "express";
import { authMiddleware } from "../../middleware/auth-middleware";
import { WebSocketManager } from "../ws/websocket-manager";
import { MessageService } from "./services/message-service";
import { asyncHandler } from "../../utils/async-wrapper";
import { SignedRequest } from "../../types/types";

export default function messageRoutes(wsManager: WebSocketManager): Router {
  const messageRoutes = Router();

  messageRoutes.delete(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: SignedRequest, res: Response) => {
      await MessageService.deleteMessage(req.params.messageId, wsManager);
      res.status(204).send();
    })
  );

  messageRoutes.patch(
    "/:messageId",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      await MessageService.editMessage(
        req.params.messageId,
        req.body,
        wsManager
      );
      res.status(204).send();
    })
  );

  return messageRoutes;
}
